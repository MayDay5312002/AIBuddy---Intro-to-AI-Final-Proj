// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let djangoProcess;
let win = null;
let cleanupDone = false;

async function waitForServer(url, callback) {
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

  win.loadURL('http://127.0.0.1:4192');

  win.on('close', (e) => {
    if (!win.isDestroyed() && !cleanupDone) {
      e.preventDefault();
    
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

const pythonPath = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
const djangoDir = path.join(__dirname, '..', 'AIBuddy');

// function runDocker() {
//   return new Promise((resolve, reject) => {
//     const dockerProcess = spawn("docker", ["desktop", "start"], {
//       env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
//     });

//     dockerProcess.stdout.on('data', (data) => {
//       console.log(`[runDocker] ${data}`);
//     });

//     dockerProcess.stderr.on('data', (data) => {
//       console.error(`[runDocker Error] ${data}`);
//     });

//     dockerProcess.on('close', (code) => {
//       if (code === 0) {
//         resolve();
//       } else {
//         reject(new Error(`runDocker exited with code ${code}`));
//       }
//     });
//   });
// }
app.whenReady().then(async () => {
  try {
    // await runDocker();
    await waitForServer('http://127.0.0.1:4192', createWindow);
  } catch (error) {
    console.log(error);
  }

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

  // waitForServer('http://127.0.0.1:4192', createWindow);
});


function runPythonScript() {
  return new Promise((resolve, reject) => {
    const removerProcess = spawn(pythonPath, ["dockerRemover.py"], {
      cwd: djangoDir,
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
      // else if(data === "answer: false\n") reject();
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
  // event.preventDefault();
  // try {
  //   await runPythonScript();
  //   console.log('dockerRemover.py completed successfully');
  //   if(win) win.destroy();
  // } catch (error) {
  //   console.error('Error running dockerRemover.py:', error);
  // }

  
  // if (djangoProcess){
  //   // djangoProcess.kill('SIGINT');
  //   // console.log('Django process killed');
  // }

  if (process.platform !== 'darwin') {
    console.log('Quitting app...');
    app.quit();

    // Give Electron a moment to quit, then forcibly exit the process
  }
});


