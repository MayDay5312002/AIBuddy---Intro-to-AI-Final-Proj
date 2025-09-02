@echo off
call venv\Scripts\activate.bat

cd AIBuddy

@REM run this program in the background (without new CMD)
start /b python manage.py runserver 

cd .\desktop

npm start

pause
