***Final Project - Intro to AI (Luke Evarretta)***

**Prerequisites**:
- git (https://git-scm.com/downloads)
- ollama (https://ollama.com/); Ensure you have pulled a model
- Node.js (https://nodejs.org/en)
- Python (I used Python 3.13) (https://www.python.org/downloads/)
- Java 11+ (https://www.oracle.com/java/technologies/downloads/)
- Microsoft C++ Build Tools (https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Docker (https://www.docker.com/)

**How install ollama and pull a model**
1. Install ollama (https://ollama.com/)
2. After installation, simply do `ollama pull nameOfModel`
    + Here some models you can pull: https://ollama.com/search
3. To see if the model is succefully pulled, simply do `ollama list`. With this command, you will see all the models you have currently.
- For more guide https://github.com/ollama/ollama/blob/main/README.md#quickstart

---
***NEW INSTRUCTION***

**To create installer**:
1. Go to desktopBuild and then `npm install` to install the needed modules for electron.
2. Go to `AIBuddy_Copy/models` then `git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2` to get the embedding model.
2. Click on the package.json and look for this:
```
      {
        "from": "../venv_cpy",
        "to": "python_env"
      }
```
3. Create a clean python virtual environment at the root directory of this repo, and then change the `venv_cpy` to the name of your newly created python virtual environment. 
    - To create a python venv: `python -m venv venvName`
    ```
            {
                "from": "../venvName",
                "to": "python_env"
            }
    ```
4. It will take some time to create the installer, but after it is done you should be able to get it in `desktopBuild/dist/`.
5. Install or run it.


---

***OLD INSTRUCTION***

**Instructions to install application**:
+ Note: Ensure you have internet connection.
- Windows installation:
    - Run `setup.bat`
- Linux/MacOS installation:
    - Run `setup.sh` by doing `sh setup.sh`.

**How to run the application**
- Web Application:
    1. go to AIBuddy folder, then do command `python manage.py runserver 4129`
        - `4192` could be any number. That is the port.
    2. Click on the URL (http://127.0.0.1:4192/ | Might be different for you) to open it as new tab in web browser
- Windows:
    - Run the `start.bat`, then wait for application to load and appear on screen.
- Linux/MacOS:
    - Run the `start.sh` by doing `sh start.sh`, then wait for application to load and appear on screen.

**To stop/exit application**:
- Web application:
    - Press CNTRL+C
- MacOS/Linux/Windows:
    - Simply close terminal that opened when the `start.bat` or `start.sh` was executed.


---

**How to use the app:**
1. Choose Execution type
    + Explain Simply - just using the knowledge of the model
    + Explain with web search - scrapes the web to gain knowledge
    + Explain with document - explain with the uploaded document
        - Input Types:
            + If you want to input a file pick "Upload a file"
            + If you want to input a youtube video pick "Enter a youtube URl"
    + Explain with Kiwix - searches for local data (.zim files)
    + Create flash cards
    + Create quiz
    + NOTE: For creation of flash cards and quizzes
        + All input types to create their content: Upload file, Entera Youtube URL, Model independent (Just using the knowledge of the model), upload Kiwix folder, and web search.
2. Explain Simply and Explain with web search do not need to upload. Just pick a thread and enter a prompt. Explain with document needs a document uploaded, either a file or a Youtube video. Explain with kiwix needs the folder all the zim files are stored (Kiwix: https://kiwix.org/en/applications/ - You might want to download Kiwix app to download zim files. It will make it easier but you can also download it manually). Depending on the input type, the creation of flash cards and quizzes might need uploading.
3. Wait for a "success" response and it will show what is stored in vector store/Kiwix folder if dealing with documents, zim files, Youtube url. If not proceed to step 4.
4. Select or create a thread with [ + ] button.
    + You can also delete thread with thrash can button
5. Ensure you have selected your thread
6. You can toggle each execution type to see what was in each feature if there is content (Explanations, Flashcards, Quizzes)
7. If you want enter a prompt, go ahead, make sure you selected the correct execution type, whether to explain with document, create flash cards about that prompt, create quiz questions regarding that prompt, or others.
+ Each thread would have its own FlashCards, quizzes, and messages, so ensure you are naming the thread correctly.
+ You can also manually add flash cards and quizzes. You can delete messasges from the message history, quizzes, and flash cards. You can modify a message, flash card, and a quiz.
+ Messages History is used to provide conversational context for generating quizzes, responses, and flash cards.
+ You can click on message history and see all the conversation in past. You can automatically/manually modify a model response, delete a conversation, or delete all conversations.
+ When upload the folder for zim files, it might take a couple seconds for the Kiwix server to be up, so it might give you an error. Just wait for a moment and submit the prompt again.
+ You can enter the present quiz when "create quiz" is selected, and present flashcards when "create flash cards" is selected.


- Note:
    1. Depending on the system you are using, you might want to execute `python ...` or `python3 ...`
    2. The Django server needs to be running locally to see the interaction with the web app.
    3. Ensure you compiled the frontend code by doing `npm run dev` or `npm run build`
    4. When choosing a model for this web app, ensure you are referring to your hardware. If your system is using integrated graphics, you might want to pull models with smaller parameters, but if you have a dedicated graphics you can pull models depending on you VRAM. 
    5. Usually, models with higher parameters have better performance.
    6. YouTube Transcript needs an  internet connection.
    7. OLLAMA PERFORMANCE MAY VARY FROM VERSION TO VERSION SO PICK THE ONE THAT WILL PROVIDE FAST RESPONSE








