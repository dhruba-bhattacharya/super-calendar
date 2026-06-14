const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('superCalendar', {
  captureWallpaperPreview: () => ipcRenderer.invoke('wallpaper:capture')
});
