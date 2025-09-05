***Final Project - Intro to AI (Luke Evarretta)***

**Prerequisites**:
- git (https://git-scm.com/downloads)
- ollama (https://ollama.com/); Ensure you have pulled a model
- Node.js (https://nodejs.org/en)
- Python (I used Python 3.13) (https://www.python.org/downloads/)
- Java 11+ (https://www.oracle.com/java/technologies/downloads/)
- Microsoft C++ Build Tools (https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**How install ollama and pull a model**
1. Install ollama (https://ollama.com/)
2. After installation, simply do `ollama pull nameOfModel`
    + Here some models you can pull: https://ollama.com/search
3. To see if the model is succefully pulled, simply do `ollama list`. With this command, you will see all the models you have currently.
- For more guide https://github.com/ollama/ollama/blob/main/README.md#quickstart

**Instructions to install application**:
+ Note: Ensure you have internet connection.
- Windows installation:
    - Run `setup.bat`
- Linux/MacOS installation:
    - Run `setup.sh` by doing `sh setup.sh`.

**How to run the application**
- Web Application:
    1. go to AIBuddy folder, then do command `python manage.py runserver`
    2. Click on the URL (http://127.0.0.1:8000/ | Might be different for you) to open it as new tab in web browser
- Windows:
    - Run the `start.bat`, then wait for application to load and appear on screen.
- Linux/MacOS:
    - Run the `start.sh` by doing `sh start.sh`, then wait for application to load and appear on screen.

**To stop/exit application**:
- Web application:
    - Press CNTRL+C
- MacOS/Linux/Windows:
    - Simply close terminal that opened when the `start.bat` or `start.sh` was executed.



**How to use the app:**
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
    4. When choosing a model for this web app, ensure you are referring with your hardware. If your system is using integrated graphics, you might want to pull models with a smaller parameters, but if you have a dedicated graphics you can pull models depending on you VRAM. 
    5. Usually models with higher parameters have better performance.
    6. Youtube Transcript needs internet connection.






