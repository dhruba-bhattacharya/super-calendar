const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('calendar', {
  captureWallpaperPreview: () => ipcRenderer.invoke('wallpaper:capture')
});
