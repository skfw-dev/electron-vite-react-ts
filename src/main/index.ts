import { app, shell, BrowserWindow, Notification, ipcMain, net } from 'electron';
import * as path from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).catch(console.error);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).catch(console.error);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(console.error);
  }
}

const showNotification = (args: string): void => {
  new Notification({
    title: 'Electron App Demo',
    body: `Message: ${args}`,
  }).show();
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId('net.skfw');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong');
  });

  ipcMain.on('notification', (_, args) => {
    const request = net.request(args as string);
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`);
      response.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        const data = JSON.parse(chunk.toString());
        showNotification(`BODY: ${data?.message}`);
      });
      response.on('end', () => {
        console.log('No more data in response.');
      });
    });
    request.end();
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
