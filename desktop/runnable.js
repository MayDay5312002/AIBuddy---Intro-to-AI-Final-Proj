// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let djangoProcess;

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
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'Logo.ico'),
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL('http://127.0.0.1:4192');
}

const pythonPath = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
const djangoDir = path.join(__dirname, '..', 'AIBuddy');
app.whenReady().then(() => {

  // const command = `"${pythonPath}" manage.py runserver`;
  // console.log(`[Django] Starting server with command: ${command}`);
  // djangoProcess = spawn(command, {
  //   cwd: djangoDir,
  //   shell: true,
  //   env: {
  //     ...process.env,
  //     PYTHONIOENCODING: 'utf-8',
  //   },
  // });

  // djangoProcess = spawn(
  //   pythonPath, 
  //   ['manage.py', 'runserver'],
  //   {
  //     cwd: djangoDir,
  //     env: {
  //       ...process.env,
  //       PYTHONIOENCODING: 'utf-8',
  //     },
  //     // detached: true, //
  //     // shell: true
  //   }
  // );

  // djangoProcess.stdout.on('data', data => console.log(`[Django] ${data}`));
  // djangoProcess.stderr.on('data', data => console.error(`[Django Error] ${data}`));

  waitForServer('http://127.0.0.1:4192', createWindow);
});


function runPythonScript() {
  return new Promise((resolve, reject) => {
    const removerProcess = spawn(pythonPath, ["dockerRemover.py"], {
      cwd: djangoDir,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    removerProcess.stdout.on('data', (data) => {
      console.log(`[dockerRemover] ${data}`);
    });

    removerProcess.stderr.on('data', (data) => {
      console.error(`[dockerRemover Error] ${data}`);
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

app.on('window-all-closed', async () => {
  try {
    await runPythonScript();
    console.log('dockerRemover.py completed successfully');
  } catch (error) {
    console.error('Error running dockerRemover.py:', error);
  }

  
  if (djangoProcess){
    // djangoProcess.kill('SIGINT');
    // console.log('Django process killed');
  }

  if (process.platform !== 'darwin') {
    console.log('Quitting app...');
    app.quit();

    // Give Electron a moment to quit, then forcibly exit the process
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }
});