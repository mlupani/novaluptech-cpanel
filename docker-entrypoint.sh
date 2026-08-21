#!/bin/sh
set -e
pnpm prisma migrate deploy
exec pnpm start -- --hostname 0.0.0.0 --port 3000
