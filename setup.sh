#!/bin/bash
# Check if python3 or python command exists
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "Python is not installed."
  exit 1
fi

# Create virtualenv if not exists
if [ ! -d "venv" ]; then
  $PYTHON -m venv venv
fi

# Activate virtualenv
source venv/bin/activate

# Install python dependencies
pip install -r requirements.txt

# Change to Django app folder and run migrations
cd AIBuddy || exit
python manage.py makemigrations
python manage.py migrate

# Install frontend npm dependencies
cd ../frontend || exit
npm install &
npm run build &

# Install desktop npm dependencies
cd ../desktop || exit
npm install &

# Keep terminal open (optional)
read -p "Press enter to continue"
