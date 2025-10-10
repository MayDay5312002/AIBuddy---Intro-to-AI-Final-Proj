// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

let win = null;
let progressWin = null;

let djangoProcess;
let cleanupDone = false;

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
  });
  if (progressWin !== null){ progressWin.close(); }

  win.loadURL('http://127.0.0.1:4192');

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


const pythonPath = path.join(process.resourcesPath, 'python_env', 'Scripts', 'python.exe'); // Adjust for OS
const djangoDir = path.join(process.resourcesPath, 'django_project');


app.whenReady().then(() => {
  fs.readFile(djangoDir+"/status.txt", 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    if(String(data).trimEnd() === "False"){ // Output file content
      installRequirements().then(() => {
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

function installRequirements() {
  return new Promise((resolve, reject) => {
    const requirementsTxt = path.join(process.resourcesPath, 'django_project', 'requirements.txt');
    const pythonProcess = spawn(pythonPath, ['-m', 'pip', 'install', '-r', requirementsTxt], {
      cwd: process.resourcesPath,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
    });

    progressWin = new BrowserWindow({
      width: 1000,
      height: 500,
      webPreferences: {
        preload: path.join(process.resourcesPath, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false, // keep this false for security
      },
    });

    if(progressWin !== null){ progressWin.loadURL(`file://${path.join(process.resourcesPath, 'progress.html')}`); }


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

