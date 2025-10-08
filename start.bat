@echo off
call venv\Scripts\activate.bat

call docker desktop start


cd desktop

start /b npm start

cd ..\AIBuddy
@REM run this program in the background (without new CMD)
call python manage.py runserver 4192

cd ..\desktop

@REM call npm start

pause
