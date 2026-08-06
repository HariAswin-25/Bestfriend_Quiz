#!/usr/bin/env bash
echo "========================================================"
echo "  Best Friend Challenge - Local Development Server"
echo "========================================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/../backend"

echo "[1/2] Installing dependencies..."
python3 -m pip install -r requirements.txt

echo ""
echo "[2/2] Starting FastAPI Development Server..."
echo "App running at: http://127.0.0.1:8000"
echo "API Docs at:    http://127.0.0.1:8000/api/docs"
echo ""

python3 run.py
