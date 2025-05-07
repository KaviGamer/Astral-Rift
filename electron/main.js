const { app, BrowserWindow } = require('electron');
const path = require('path');

// tell electron-reload to watch your game folder (one level up)
require('electron-reload')( path.join(__dirname,'../'), {
  // point to the local electron binary
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  // optionally filter which files to watch:
  // glob: ['../**/*.js','../**/*.html']
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1024, height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });
  win.loadFile(path.join(__dirname, '../index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
// This is the main process of your Electron app.
// It is responsible for creating and managing the main window.
// The main process can also communicate with the renderer process (the web page) using IPC (Inter-Process Communication).
// The main process can also use Node.js modules and APIs directly.
// The main process can also use Electron APIs to create menus, dialogs, notifications, etc.