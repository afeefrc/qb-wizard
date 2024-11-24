/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';
import { execFile } from 'child_process';
import os from 'os';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    // Add error handling for updates
    autoUpdater.on('error', (error) => {
      log.error('Auto updater error:', error);
      if (error.message.includes('Failed to uninstall old application files')) {
        this.handleUninstallError();
      }
    });

    // Add logging for update events
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
    });

    autoUpdater.checkForUpdatesAndNotify();
  }

  private handleUninstallError() {
    // Clean up old update files
    try {
      const updatePath = path.join(os.tmpdir(), 'electron-updater');
      if (fs.existsSync(updatePath)) {
        fs.rmdirSync(updatePath, { recursive: true });
      }
    } catch (err) {
      log.error('Failed to clean up update files:', err);
    }
  }
}

let mainWindow: BrowserWindow | null = null;

// prevent multiple instance of the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we can't get the lock, try to signal the existing instance
  try {
    // Force quit the current instance and start a new one
    app.quit();
    setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, 1000);
  } catch (error) {
    console.error('Failed to relaunch:', error);
    app.exit(0);
  }
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      try {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      } catch (error) {
        console.error('Failed to focus existing window:', error);
        // If focusing fails, force restart the app
        app.relaunch();
        app.exit(0);
      }
    } else {
      // If mainWindow doesn't exist, restart the app
      app.relaunch();
      app.exit(0);
    }
  });
}

// qpdf path

// function getQPDFPath() {
//   const platform = os.platform();
//   const arch = os.arch();
//   const qpdfDir = path.join(
//     __dirname,
//     '..',
//     '..',
//     'resources',
//     'qpdf',
//     `${platform}-${arch}`,
//   );
//   const qpdfBinary = platform === 'win32' ? 'qpdf.exe' : 'qpdf';
//   return path.join(qpdfDir, qpdfBinary);
// }

// ipcMain.handle('encrypt-pdf', async (event, pdfData) => {
//   const tempDir = os.tmpdir();
//   const inputPath = path.join(tempDir, 'input.pdf');
//   const outputPath = path.join(tempDir, 'encrypted.pdf');

//   // Write the PDF data to a temporary file
//   fs.writeFileSync(inputPath, Buffer.from(pdfData));

//   // Encrypt the PDF using qpdf
//   const password = '123456'; // You might want to generate this dynamically
//   const qpdfPath = getQPDFPath();

//   await new Promise((resolve, reject) => {
//     execFile(
//       qpdfPath,
//       ['--encrypt', password, password, '128', '--', inputPath, outputPath],
//       (error) => {
//         if (error) {
//           console.error('QPDF encryption error:', error);
//           reject(error);
//         } else {
//           resolve();
//         }
//       },
//     );
//   });

//   // Clean up the input file
//   fs.unlinkSync(inputPath);

//   return outputPath;
// });

ipcMain.on('download-file', (event, filePath, suggestedName) => {
  dialog
    .showSaveDialog({
      defaultPath: suggestedName,
    })
    .then(({ filePath: savePath }) => {
      if (savePath) {
        fs.copyFileSync(filePath, savePath);
        // Clean up the temporary encrypted file
        fs.unlinkSync(filePath);
      }
    });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      devTools: !app.isPackaged, // Enable DevTools in development mode
    },
  });

  // Install React DevTools in development mode
  if (!app.isPackaged) {
    try {
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (e) {
      console.error('Failed to install extension:', e);
    }
  }

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Automatically open DevTools in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

// Add this function to force cleanup all resources
function forceCleanup() {
  if (mainWindow) {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.closeDevTools();
      mainWindow.destroy();
    }
    mainWindow = null;
  }
  // Force garbage collection
  if (global.gc) global.gc();
}

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  forceCleanup();
  app.quit();
});

app.on('before-quit', (event) => {
  // If you need to do any cleanup in the main process, do it here
  console.log('App is about to quit');
  event.preventDefault(); // prevent default quit
  forceCleanup();
  app.exit(0);
});

app.on('will-quit', () => {
  forceCleanup();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

app.on('ready', createWindow);

// app.on('web-contents-created', (event, contents) => {
//   contents.session.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: filesystem:;",
//         ],
//       },
//     });
//   });
// });
