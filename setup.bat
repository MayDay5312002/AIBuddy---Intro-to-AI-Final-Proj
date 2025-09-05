@echo off
if not exist venv (
  python -m venv venv
)
call venv\Scripts\activate.bat
call python -m pip install -r requirements.txt

cd AIBuddy
cd models
call git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
call python manage.py makemigrations
call python manage.py migrate


cd ..

cd frontend
call npm install
call npm run build

cd ..\desktop
call npm install

pause
