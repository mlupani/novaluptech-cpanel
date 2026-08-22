"use client";

import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	closestCorners,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ClientWorkspace, Task, TaskStatus } from "@/types/client";
import { createTask, deleteTask, queryKeys, reorderTasks } from "@/lib/api/clients";
import { taskColumns } from "@/lib/labels";

interface TaskBoardProps {
	client: ClientWorkspace;
}

type Columns = Record<TaskStatus, Task[]>;

function emptyColumns(): Columns {
	return {
		todo: [],
		in_progress: [],
		testing: [],
		done: [],
		production: [],
	};
}

function groupTasks(tasks: Task[]): Columns {
	const next = emptyColumns();
	for (const task of tasks) {
		next[task.status].push(task);
	}
	for (const column of taskColumns) {
		next[column.id].sort((a, b) => a.position - b.position);
	}
	return next;
}

function flatten(columns: Columns): Task[] {
	return taskColumns.flatMap((column) =>
		columns[column.id].map((task, position) => ({
			...task,
			status: column.id,
			position,
		})),
	);
}

function findContainer(id: string, columns: Columns): TaskStatus | undefined {
	if (id in columns) return id as TaskStatus;
	return taskColumns.find((column) =>
		columns[column.id].some((task) => task.id === id),
	)?.id;
}

export function TaskBoard({ client }: TaskBoardProps) {
	const queryClient = useQueryClient();
	const incomingTasks = client.tasks ?? [];
	const [columns, setColumns] = useState<Columns>(() =>
		groupTasks(incomingTasks),
	);
	const [syncedTasks, setSyncedTasks] = useState(incomingTasks);
	const [draft, setDraft] = useState("");
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	if (incomingTasks !== syncedTasks) {
		setSyncedTasks(incomingTasks);
		setColumns(groupTasks(incomingTasks));
	}

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 180, tolerance: 8 },
		}),
	);

	const persist = useMutation({
		mutationFn: (tasks: Task[]) =>
			reorderTasks(
				client.id,
				tasks.map((task) => ({
					id: task.id,
					status: task.status,
					position: task.position,
				})),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.client(client.id) });
		},
	});

	const addMutation = useMutation({
		mutationFn: (title: string) => createTask(client.id, { title, status: "todo" }),
		onSuccess: (task) => {
			setColumns((current) => ({
				...current,
				todo: [...current.todo, task],
			}));
			setDraft("");
			queryClient.invalidateQueries({ queryKey: queryKeys.client(client.id) });
		},
	});

	const removeMutation = useMutation({
		mutationFn: (taskId: string) => deleteTask(client.id, taskId),
		onSuccess: (_void, taskId) => {
			setColumns((current) => {
				const next = emptyColumns();
				for (const column of taskColumns) {
					next[column.id] = current[column.id].filter(
						(task) => task.id !== taskId,
					);
				}
				return next;
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.client(client.id) });
		},
	});

	const handleDragStart = (event: DragStartEvent) => {
		const task = flatten(columns).find((item) => item.id === event.active.id);
		setActiveTask(task ?? null);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;
		const from = findContainer(String(active.id), columns);
		const to = findContainer(String(over.id), columns);
		if (!from || !to || from === to) return;

		setColumns((current) => {
			const source = [...current[from]];
			const target = [...current[to]];
			const fromIndex = source.findIndex((task) => task.id === active.id);
			if (fromIndex < 0) return current;
			const [moved] = source.splice(fromIndex, 1);
			const overIndex = target.findIndex((task) => task.id === over.id);
			const insertAt = overIndex >= 0 ? overIndex : target.length;
			target.splice(insertAt, 0, { ...moved, status: to });
			return { ...current, [from]: source, [to]: target };
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveTask(null);
		if (!over) return;

		const from = findContainer(String(active.id), columns);
		const to = findContainer(String(over.id), columns);
		if (!from || !to) return;

		if (from === to) {
			const list = [...columns[from]];
			const oldIndex = list.findIndex((task) => task.id === active.id);
			const newIndex = list.findIndex((task) => task.id === over.id);
			if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
				persist.mutate(flatten(columns));
				return;
			}
			const nextList = [...list];
			const [moved] = nextList.splice(oldIndex, 1);
			nextList.splice(newIndex, 0, moved);
			const next = { ...columns, [from]: nextList };
			setColumns(next);
			persist.mutate(flatten(next));
			return;
		}

		persist.mutate(flatten(columns));
	};

	const total = useMemo(
		() => taskColumns.reduce((sum, column) => sum + columns[column.id].length, 0),
		[columns],
	);

	return (
		<aside className="flex w-full min-w-0 flex-1 flex-col border border-white/10 bg-ink-soft/40 lg:sticky lg:top-6">
			<div className="border-b border-white/10 px-4 py-4">
				<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
					Tablero
				</p>
				<div className="mt-1 flex items-end justify-between gap-3">
					<h3 className="font-display text-2xl text-paper">Tareas</h3>
					<span className="text-[11px] tracking-widest text-ink-muted uppercase">
						{total}
					</span>
				</div>
				<form
					className="mt-3 flex gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						if (!draft.trim()) return;
						addMutation.mutate(draft.trim());
					}}
				>
					<input
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="Nueva tarea"
						className="field"
					/>
					<button
						type="submit"
						disabled={addMutation.isPending}
						className="btn-primary btn-compact shrink-0"
					>
						+
					</button>
				</form>
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain p-4 lg:grid lg:flex-1 lg:snap-none lg:grid-cols-5 lg:overflow-visible lg:p-5">
					{taskColumns.map((column) => (
						<BoardColumn
							key={column.id}
							id={column.id}
							label={column.label}
							tasks={columns[column.id]}
							onDelete={(taskId) => removeMutation.mutate(taskId)}
						/>
					))}
				</div>
				<DragOverlay>
					{activeTask ? <TaskCard task={activeTask} overlay /> : null}
				</DragOverlay>
			</DndContext>
		</aside>
	);
}

interface BoardColumnProps {
	id: TaskStatus;
	label: string;
	tasks: Task[];
	onDelete: (taskId: string) => void;
}

function BoardColumn({ id, label, tasks, onDelete }: BoardColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id });

	return (
		<section
			ref={setNodeRef}
			className={`flex min-h-[18rem] w-[min(16.5rem,78vw)] shrink-0 snap-start flex-col border lg:min-h-[32rem] lg:w-auto ${
				isOver ? "border-copper/70 bg-copper/5" : "border-white/10 bg-ink/50"
			}`}
		>
			<header className="border-b border-white/10 px-2 py-2">
				<p className="text-[10px] leading-tight tracking-[0.12em] text-copper-soft uppercase">
					{label}
				</p>
				<p className="text-[10px] text-ink-muted">{tasks.length}</p>
			</header>
			<SortableContext
				items={tasks.map((task) => task.id)}
				strategy={verticalListSortingStrategy}
			>
				<ul className="flex flex-1 flex-col gap-2 p-2">
					{tasks.map((task) => (
						<SortableTask key={task.id} task={task} onDelete={onDelete} />
					))}
				</ul>
			</SortableContext>
		</section>
	);
}

interface SortableTaskProps {
	task: Task;
	onDelete: (taskId: string) => void;
}

function SortableTask({ task, onDelete }: SortableTaskProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: task.id });

	return (
		<li
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className={isDragging ? "opacity-40" : ""}
			{...attributes}
			{...listeners}
		>
			<TaskCard task={task} onDelete={onDelete} />
		</li>
	);
}

interface TaskCardProps {
	task: Task;
	onDelete?: (taskId: string) => void;
	overlay?: boolean;
}

function TaskCard({ task, onDelete, overlay }: TaskCardProps) {
	return (
		<article
			className={`border border-copper-soft/30 bg-copper px-2 py-2 text-ink shadow-[0_1px_0_rgba(18,17,14,0.18)] ${
				overlay ? "rotate-1 cursor-grabbing" : "cursor-grab"
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<p className="text-[13px] font-medium leading-snug">{task.title}</p>
				{onDelete ? (
					<button
						type="button"
						className="mt-0.5 shrink-0 p-0.5 text-ink/55 hover:text-ink"
						onPointerDown={(event) => event.stopPropagation()}
						onClick={() => {
							if (confirm(`¿Eliminar la tarea «${task.title}»?`)) {
								onDelete(task.id);
							}
						}}
						aria-label="Eliminar tarea"
					>
						<TrashIcon />
					</button>
				) : null}
			</div>
		</article>
	);
}

function TrashIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-[18px] w-[18px]"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="square"
			strokeLinejoin="miter"
		>
			<path d="M4 7h16" />
			<path d="M9 7V5h6v2" />
			<path d="M6 7l1 13h10l1-13" />
			<path d="M10 11v6M14 11v6" />
		</svg>
	);
}
