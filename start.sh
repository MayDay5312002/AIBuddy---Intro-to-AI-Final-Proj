#!/bin/sh

# Check if 'python3' is available and is Python 3
if command -v python3 >/dev/null 2>&1; then
  PYTHON_CMD=python3
elif command -v python >/dev/null 2>&1; then
  # Check if 'python' points to Python 3
  if python -c 'import sys; exit(0 if sys.version_info[0] == 3 else 1)'; then
    PYTHON_CMD=python
  else
    echo "Neither python3 nor python points to Python 3."
    exit 1
  fi
else
  echo "No suitable Python interpreter found."
  exit 1
fi

# Activate virtual environment
. venv/bin/activate

cd AIBuddy

# Use dynamic python command to run server
$PYTHON_CMD manage.py runserver &

cd ../desktop

npm start

wait
