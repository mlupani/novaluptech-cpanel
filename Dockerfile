FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
ENV DATABASE_URL="postgresql://novalup:novalup@postgres:5432/novalup"
RUN pnpm prisma generate
RUN pnpm exec next build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV UPLOAD_DIR=/data/uploads

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/prisma.config.ts /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/public ./public
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /data/uploads

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
