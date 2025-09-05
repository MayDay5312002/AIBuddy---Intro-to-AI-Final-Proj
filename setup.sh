#!/bin/sh
# Check if python3 or python command exists
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "Python is not installed."
  exit 1
fi

if command -v pip3 &>/dev/null; then
  PIP=pip3
elif command -v pip &>/dev/null; then
  PIP=pip
else
  echo "pip is not installed."
  exit 1
fi

# Create virtualenv if not exists
if [ ! -d "venv" ]; then
  $PYTHON -m venv venv
fi

# Activate virtualenv
. venv/bin/activate

# Install python dependencies
pip install -r requirements.txt

# Change to Django app folder and run migrations
cd AIBuddy || exit
cd models
call git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
python manage.py makemigrations
python manage.py migrate
cd ..

# Install frontend npm dependencies
cd ./frontend || exit
npm install 
npm run build 

# Install desktop npm dependencies
cd ../desktop || exit
npm install 

# Keep terminal open (optional)
echo "FINIHED!!"
