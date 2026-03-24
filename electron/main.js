const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  mainWindow.loadURL("http://localhost:3001");
}

app.whenReady().then(() => {
  const isDev = !app.isPackaged;
  const backendPath = isDev
    ? path.join(__dirname, "../backend")
    : path.join(process.resourcesPath, "backend");

  if (isDev) {
    serverProcess = spawn("npx", ["ts-node", "src/app.ts"], {
      cwd: backendPath,
      shell: true,
    });
  } else {
    serverProcess = spawn("node", ["dist/src/app.js"], {
      cwd: backendPath,
      shell: true,
    });
  }

  setTimeout(createWindow, 3000);
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});
