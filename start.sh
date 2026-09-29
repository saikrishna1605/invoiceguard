#!/usr/bin/env bash
set -e

echo "======================================"
echo " InvoiceGuard — Production Startup"
echo "======================================"

echo "Seeding demo reference data..."
python -m app.seed_data

echo "Starting InvoiceGuard API..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}"
