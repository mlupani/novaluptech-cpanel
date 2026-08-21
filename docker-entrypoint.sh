#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL no está definida"
  exit 1
fi

echo "Waiting for Postgres at postgres:5432..."
i=0
while [ "$i" -lt 30 ]; do
  if node -e "require('net').connect({host:'postgres',port:5432},()=>process.exit(0)).on('error',()=>process.exit(1))"; then
    echo "Postgres TCP is open"
    break
  fi
  i=$((i + 1))
  echo "  attempt $i/30..."
  sleep 2
done

if [ "$i" -ge 30 ]; then
  echo "No se alcanza postgres:5432. En el VPS:"
  echo "  docker compose -f docker-compose.prod.yml ps"
  echo "  docker logs novalup-crm-postgres-1 --tail 50"
  exit 1
fi

# Prisma engines on Alpine often fail Docker DNS; pin the IPv4 address.
export PG_IP="$(node -e "require('dns').lookup('postgres',{family:4},(err,addr)=>{if(err){console.error(err);process.exit(1)};process.stdout.write(addr)})")"
export DATABASE_URL="$(node -e "process.stdout.write(String(process.env.DATABASE_URL).replace('@postgres:', '@'+process.env.PG_IP+':'))")"

# Postgres can accept TCP before it is ready for queries.
sleep 2

echo "Migrating via ${PG_IP}:5432..."
pnpm prisma migrate deploy

exec pnpm exec next start -H 0.0.0.0 -p 3000
