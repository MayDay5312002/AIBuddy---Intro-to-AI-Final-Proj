@echo off
if not exist venv (
  python -m venv venv
)
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt

cd AIBuddy
python manage.py makemigrations
python manage.py migrate

cd frontend
npm install
npm run build

cd ..\desktop
npm install

pause
