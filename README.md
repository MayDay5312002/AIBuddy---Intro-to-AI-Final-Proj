***Final Project - Intro to AI (Luke Evarretta)***

**Prerequisites**:
- ollama (https://ollama.com/); Ensure you have pulled a model
- Node.js (https://nodejs.org/en)
- Python (I used Python 3.11)
- Java 11+
- Microsoft C++ Build Tools

**Instructions to run web app**:
1. Install prerequisites
2. Pull a model (I use llama3.1:8b; This process take a couple minutes)
3. Check in terminal if you have a model with command: `ollama list`
    - If you do not have a model then go back to 2
4. `git clone https://github.com/MayDay5312002/AIBuddy---Intro-to-AI-Final-Proj.git` or extract the zip file "AIBuddy---Intro-to-AI-Final-Proj.zip".
5. Create a virtual environment directory in the root directory where requirements.txt is at. `python -m venv venv` (depends on your system)
6. Activate your virtual environment `venv\Scripts\activate` or `source venv\bin\activate`
7. Install requirements of venv by installing requirements.txt `pip install -r requirements.txt`
8. Go to AIBuddy folder, then do `python manage.py makemigrations` and then do `python manage.py migrate` (This will setup database, but also cause installation of embedding model also)
9. Go to AIBuddy/frontend folder, then install packages/modules by executing `npm install`. After installation, `npm run dev` to compile the frontend code of the web app.
10. After doing everything, run the django server by going back to AIBuddy folder, then doing `python manage.py runserver`.
11. Click the link for development server to start running the web app.
    - http://127.0.0.1:8000/ (Most likely this is link for you where the app is running)
12. After doing all the setup above, you can just `python manage.py runserver` to run the web app again.
13. To quit running the web app, simply `CNTRL+C` in the command lin where the Django server is running. This will shutdown the Django server.

**Optional - To install electron to make the web app a desktop app:**
1. Go to the AIBuddy\desktop and then `npm install`
2. After installing everything, simply do `npm start` to start the desktop application
+ Note: You do not have to `python manage.py runserver`. Simply just `npm start`.

**How to use the web app:**
1. Choose input type
    + If you want to input a file pick "Upload a file"
    + If you want to input a youtube video pick "Enter a youtube URl"
2. Input the file or url
3. Submit the file or url
4. Wait for a "success" response and it will show what is stored in vector store/DB
5. Select or create a thread with [ + ] button.
    + You can also delete thread with thrash can button
6. Ensure you have selected your thread
7. You can toggle each execution type to see what was in each feature if there is content (Explanation, Flashcards, Quizzes)
8. If you want enter a prompt, go ahead, make sure you selected the correct execution type, whether to explain that prompt, create flash cards about that prompt, or create quiz questions regarding that prompt (These will be based on the content you uploaded/submitted)
+ Each thread would have its own FlashCards, quizzes, and messages, so ensure you are naming the thread correctly.
- Note:
    1. Depending on the system you are using, you might want to execute `python ...` or `python3 ...`
    2. The Django server needs to running locally to see the intereact with web app.
    3. Ensure you compiled the frontend code by doing `npm run dev` or `npm run build`
    4. When choosing a model for this webapp, ensure you are referring with your hardware. If your system is using integrated graphics, you might want to pull models with a smaller parameters, but if you have a dedicated graphics you can pull models depending on you VRAM. 
    5. Usually models with higher parameters have better performance.






