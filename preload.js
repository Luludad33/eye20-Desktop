const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onSessionComplete: (callback) => ipcRenderer.on('session-complete', callback),
  onRoundUpdate: (callback) => ipcRenderer.on('round-update', callback),
  sendRoundUpdate: (round, maxCycles) => ipcRenderer.send('round-update', { round, maxCycles }),
  sendSessionComplete: () => ipcRenderer.send('session-complete'),
});
