#!/bin/sh

echo "Waiting for PostgreSQL to start..."
sleep 5

echo "Running Prisma migrations..."
npx prisma db push --accept-data-loss

echo "Database initialization completed!"
