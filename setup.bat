@echo off
if not exist venv (
  python -m venv venv
)
call venv\Scripts\activate.bat
call python -m pip install -r requirements.txt

call docker pull ghcr.io/kiwix/kiwix-serve:3.7.0

cd AIBuddy
cd models
call git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
cd ..
call python manage.py makemigrations
call python manage.py migrate


cd frontend
call npm install
call npm run build

cd ..\..\desktop
call npm install

pause
