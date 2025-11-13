#!/usr/bin/env bash
# Start both backend and frontend in development mode from repository root.
# Usage: ./start-dev.sh

set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Root: $ROOT_DIR"

# Backend: install (if needed) and run in dev (ts-node-dev) or build+run
if [ -d "$BACKEND_DIR" ]; then
  echo "Starting backend..."
  (cd "$BACKEND_DIR" && npm install --no-audit --no-fund || true)
  # start backend in background
  (cd "$BACKEND_DIR" && npm run dev) &
else
  echo "Backend folder not found: $BACKEND_DIR"
fi

# Frontend: install and run dev (vite)
if [ -d "$FRONTEND_DIR" ]; then
  echo "Starting frontend..."
  (cd "$FRONTEND_DIR" && npm install --no-audit --no-fund || true)
  (cd "$FRONTEND_DIR" && npm run dev) &
else
  echo "Frontend folder not found: $FRONTEND_DIR"
fi

wait
