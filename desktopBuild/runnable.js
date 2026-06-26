const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const gotTheLock = app.requestSingleInstanceLock();

let win = null;
let progressWin = null;

let djangoProcess;
let cleanupDone = false;
let mainAppRunning = false;

if (!gotTheLock) {
  // If the lock was not acquired, quit the app
  app.quit();
} else {
  // This is the primary instance—continue app initialization here
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    } 
    else if(progressWin){
      if (progressWin.isMinimized()) progressWin.restore();
      progressWin.focus();
    }
  });

    function waitForServer(url, callback) {
    const interval = setInterval(() => {
      http.get(url, res => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          callback();
        }
      }).on('error', () => {});
    }, 1000);
  }

  function createWindow() {
    win = new BrowserWindow({
      width: 1000,
      height: 800,
      icon: path.join(__dirname, 'Logo.ico'),
      webPreferences: {
        contextIsolation: true,
      },
      menu: false
    });
    if (progressWin !== null){ progressWin.close(); }

    win.loadURL('http://127.0.0.1:4192');
    checkAndInstallOllama();

     win.on('close', (e) => {
      if (!win.isDestroyed() && !cleanupDone) {
        e.preventDefault();
        win.loadURL('http://127.0.0.1:4192/loading');
      
        runPythonScript().then(() => {
          cleanupDone = true;
          win.removeAllListeners('close');
          win.close();
        }).catch(() => {
          cleanupDone = true;
          win.removeAllListeners('close');
          win.close();
        });
      }
    });

  }

  function checkAndInstallOllama() {
    // Check if Ollama is installed (port 11434)
    fetch('http://localhost:11434/api/version')
      .then(() => {
        console.log('Ollama already installed');
      })
      .catch(() => {
        // Not installed - prompt user to install
        const { dialog } = require('electron');
        dialog.showMessageBox({
          type: 'info',
          title: 'Ollama Required',
          message: 'Ollama is not running. Would you like to download it?',
          buttons: ['Download', 'Continue without Ollama'],
        }).then(result => {
          if (result.response === 0) {
            // Open Ollama download page
            shell.openExternal('https://ollama.com/download');
          } 
          // else {
          //   app.exit();
          // }
        });
      });
  }


  // const pythonPath = path.join(process.resourcesPath, 'python_env', 'Scripts', 'python.exe'); // Adjust for OS
  // let pythonPath = null;
  const djangoDir = path.join(process.resourcesPath, 'django_project');

  // Create the venv inside django_project
  const venvDir = path.join(djangoDir, '.venv');
  const pythonPath = path.join(venvDir, 'Scripts', 'python.exe');


  app.whenReady().then(() => {
    fs.readFile(djangoDir+"/status.txt", 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      if(String(data).trimEnd() === "False"){ // Output file content
        // console.log(pythonPath);
        createVenv()
        .then(() => installRequirements())
        .then(() => {
          mainAppRunning = true;
          fs.writeFileSync(djangoDir+"/status.txt", "True");
          let dockerProcess = spawn("docker", ["desktop", "start"]);
          let managePy = path.join(process.resourcesPath, 'django_project', 'manage.py');
          dockerProcess.on('exit', (code) => {
            djangoProcess = spawn(pythonPath, [managePy, 'runserver', '4192'], 
            {
            cwd: djangoDir,
            env: {
              ...process.env,
              PYTHONIOENCODING: 'utf-8',
            },
          });
        
        
          djangoProcess.stdout.on('data', data => console.log(`[Django] ${data}`));
          djangoProcess.stderr.on('data', data => console.error(`[Django Error] ${data}`));
        
          waitForServer('http://127.0.0.1:4192', createWindow);

          });
        });
      } else {
        let dockerProcess = spawn("docker", ["desktop", "start"]);
        let managePy = path.join(process.resourcesPath, 'django_project', 'manage.py');
        dockerProcess.on('exit', (code) => {
          djangoProcess = spawn(pythonPath, [managePy, 'runserver', '4192'], 
          {
          cwd: djangoDir,
          env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8',
          },
        });
      
      
        djangoProcess.stdout.on('data', data => console.log(`[Django] ${data}`));
        djangoProcess.stderr.on('data', data => console.error(`[Django Error] ${data}`));
      
        waitForServer('http://127.0.0.1:4192', createWindow);

        });
      }

    });


  });

  function ensureProgressWindow() {
    if (progressWin !== null) return;
    checkAndInstallOllama();
    progressWin = new BrowserWindow({
      width: 1000,
      height: 500,
      webPreferences: {
        preload: path.join(process.resourcesPath, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      menu: false
    });

    progressWin.loadURL(`file://${path.join(process.resourcesPath, 'progress.html')}`);

    progressWin.on('close', (e) => {
      if (!progressWin.isDestroyed() && !mainAppRunning) {
        e.preventDefault();
        progressWin.loadURL('http://127.0.0.1:4192/loading');


        progressWin.removeAllListeners('close');
        progressWin.close();
        
      
      }
    });
    // progressWin.loadFile(path.join(process.resourcesPath, 'progress.html'));
  }

  function sendProgress(message) {
    if (!progressWin) return;
    if (progressWin.webContents.isLoading()) {
      progressWin.webContents.once('did-finish-load', () => {
        progressWin.webContents.send('message', message);
      });
    } else {
      progressWin.webContents.send('message', message);
    }
  }



  function createVenv() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(pythonPath)) {
        resolve();
        return;
      }

      ensureProgressWindow();
      sendProgress('Creating Python virtual environment...\n');

      const venvProcess = spawn('python',['-m', 'venv', venvDir], {
        cwd: djangoDir,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      });



      venvProcess.stdout.on('data', data => {
        sendProgress(String(data));
        console.log(`[createVenv] ${data}`);
      });

      venvProcess.stderr.on('data', data => {
        console.error(`[createVenv Error] ${data}`);
        sendProgress(String(data));
      });

      venvProcess.on('error', err => reject(err));

      venvProcess.on('close', code => {
        sendProgress('Python virtual environment created.\n');
        if (code === 0 && fs.existsSync(pythonPath)) {
          resolve();
        } else {
          reject(new Error(`createVenv exited with code ${code}`));
        }
      });
    });
  }

  function installRequirements() {
    return new Promise((resolve, reject) => {
      ensureProgressWindow();
      sendProgress('Installing requirements...\n');
      const requirementsTxt = path.join(process.resourcesPath, 'django_project', 'requirements.txt');
      const pythonProcess = spawn(pythonPath, ['-m', 'pip', 'install', '-r', requirementsTxt], {
        cwd: process.resourcesPath,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      });
      
      // if (progressWin === null){ 
      //    progressWin = new BrowserWindow({
      //      width: 1000,
      //      height: 500,
      //      webPreferences: {
      //        preload: path.join(process.resourcesPath, 'preload.js'),
      //        contextIsolation: true,
      //        nodeIntegration: false, // keep this false for security
      //      },
      //    });
       
      //    if(progressWin !== null){ progressWin.loadURL(`file://${path.join(process.resourcesPath, 'progress.html')}`); }
      // }
      // progressWin = new BrowserWindow({
      //   width: 1000,
      //   height: 500,
      //   webPreferences: {
      //     preload: path.join(process.resourcesPath, 'preload.js'),
      //     contextIsolation: true,
      //     nodeIntegration: false, // keep this false for security
      //   },
      // });

      // if(progressWin !== null){ progressWin.loadURL(`file://${path.join(process.resourcesPath, 'progress.html')}`); }

      // progressWin.webContents.send('message', String(pythonPath));

      pythonProcess.stdout.on('data', data => {
        progressWin.webContents.send('message', String(data));
        console.log(`[installRequirements] ${data}`);
      });

      pythonProcess.stderr.on('data', data => {
        progressWin.webContents.send('message', String(data));
        console.error(`[installRequirements Error] ${data}`);
      });


      pythonProcess.on('close', (code) => {
        // progressWin.close();
        progressWin.webContents.send('message', '**********Starting AI Study Companion... Please wait...**********');

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`installRequirements exited with code ${code}`));
        }
      });
    });
  }

  function killDjango() {
    return new Promise((resolve) => {
      if (djangoProcess) {
        if (process.platform === 'win32') {
          exec(`taskkill /PID ${djangoProcess.pid} /T /F`, (error) => {
            if (error) {
              console.error('Failed to kill Django process:', error);
            } else {
              console.log('Django process terminated');
            }
            resolve();
          });
        } else {
          djangoProcess.once('exit', () => {
            console.log('Django process terminated');
            resolve();
          });
          djangoProcess.kill('SIGTERM');
        }
      } else {
        resolve();
      }
    });
  }


  function runPythonScript() {
    return new Promise((resolve, reject) => {
      const removerProcess = spawn(pythonPath, ["dockerRemover.py"], {
        cwd: path.join(process.resourcesPath, 'django_project'),
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      });

      removerProcess.stdout.on('data', (data) => {
        console.log(`[dockerRemover] ${data}`);
        if(String(data).trimEnd() === "answer: True") {
          spawn("docker", ["desktop", "stop"]);
          resolve();
        } else if(String(data).trimEnd() === "answer: False"){
          reject();
        }
      });

      removerProcess.stderr.on('data', (data) => {
        console.error(`[dockerRemover Error] ${data}`);
        // reject();
      });

      removerProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`dockerRemover exited with code ${code}`));
        }
      });
    });
  }

  app.on('window-all-closed', async (event) => {

    killDjango().then(() => {
      if (process.platform !== 'darwin') {
        console.log('Quitting app...');
        app.quit();
      }
    });
  });


}