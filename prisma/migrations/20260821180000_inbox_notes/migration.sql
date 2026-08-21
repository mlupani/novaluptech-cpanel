-- CreateTable
CREATE TABLE "InboxNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboxNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InboxNote_done_createdAt_idx" ON "InboxNote"("done", "createdAt");
