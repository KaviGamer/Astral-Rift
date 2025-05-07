// You can expose APIs to the renderer here if needed
// e.g., safe IPC
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // expose APIs as needed
});
