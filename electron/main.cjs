const { app, BrowserWindow, ipcMain, nativeTheme, desktopCapturer } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 980,
    minHeight: 680,
    title: 'Super Calendar',
    backgroundColor: '#090b12',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) mainWindow.loadURL('http://localhost:4173');
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('wallpaper:capture', async () => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 1920, height: 1080 } });
  return sources[0]?.thumbnail.toDataURL() ?? null;
});
