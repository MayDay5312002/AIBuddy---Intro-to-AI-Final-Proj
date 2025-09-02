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
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL('http://127.0.0.1:8000');
}


app.whenReady().then(() => {
  const pythonPath = path.join(__dirname, '..', '..', 'venv', 'Scripts', 'python.exe');
  const djangoDir = path.join(__dirname, '..');

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

  waitForServer('http://127.0.0.1:8000', createWindow);
});

app.on('window-all-closed', () => {
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

