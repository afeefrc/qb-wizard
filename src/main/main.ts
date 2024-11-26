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
import { autoUpdater, AutoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';
import { execFile } from 'child_process';
import os from 'os';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import { authenticator } from 'otplib';
import { hash, compare } from 'bcryptjs';
import * as cryptoUtils from './crypto';
import * as totp from './totp';

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let mainWindow: BrowserWindow | null = null;

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Add IPC handlers for the Footer component
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('check-for-updates', async () => {
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo.version;
    });

    ipcMain.handle('start-update', () => {
      log.info('Starting update download...');
      return autoUpdater.downloadUpdate();
    });

    ipcMain.handle('quit-and-install', () => {
      log.info('Quitting and installing update...');
      this.prepareForUpdate();
      autoUpdater.quitAndInstall(false, true);
    });

    // Notify renderer about update events
    autoUpdater.on('update-downloaded', () => {
      mainWindow?.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', (error) => {
      log.error('Auto updater error:', error);
      if (error.message.includes('Failed to uninstall old application files')) {
        this.handleUninstallError();
        mainWindow?.webContents.send('update-error', 'uninstall-error');
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

    // Check for updates when app starts
    autoUpdater.checkForUpdates();

    // Add download progress handler
    autoUpdater.on('download-progress', (progressObj) => {
      mainWindow?.webContents.send('download-progress', progressObj.percent);
    });
  }

  private handleUninstallError() {
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Error',
      message:
        'Unable to install the update. Please close all instances of the application and try again.',
      detail:
        'If the problem persists, please manually close the application from Task Manager.',
      buttons: ['OK'],
    });
  }

  private prepareForUpdate() {
    // Force cleanup before update
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.closeDevTools();
      mainWindow.destroy();
    }

    // Close any other windows or resources
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });

    // Force garbage collection if available
    if (global.gc) global.gc();
  }
}

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

  // Handle auth-related IPC calls
  ipcMain.handle('auth:generateTOTP', () => {
    try {
      return authenticator.generateSecret();
    } catch (error) {
      console.error('TOTP secret generation error:', error);
      throw error;
    }
  });

  ipcMain.handle('auth:verifyTOTP', (_, token: string, secret: string) => {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error('TOTP verification error:', error);
      throw error;
    }
  });

  ipcMain.handle('crypto:hashPassword', async (_, password: string) => {
    try {
      console.log('Hashing password...'); // Debug log
      const hashedPassword = await hash(password, 10);
      console.log('Password hashed successfully'); // Debug log
      return hashedPassword;
    } catch (error) {
      console.error('Password hashing error:', error);
      throw error; // Propagate the error back to the renderer
    }
  });

  ipcMain.handle(
    'crypto:verifyPassword',
    async (_, password: string, hash: string) => {
      try {
        return await compare(password, hash);
      } catch (error) {
        console.error('Password verification error:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('crypto:generateRandomString', (_, length: number) => {
    try {
      return cryptoUtils.generateRandomString(length);
    } catch (error) {
      console.error('Error generating random string:', error);
      throw error;
    }
  });

  // Add IPC listener
  ipcMain.on('ipc-example', (event, arg) => {
    console.log('Received in main:', arg);
    // Send response back to renderer
    event.reply('ipc-example', 'pong');
  });

  // Add TOTP handlers
  ipcMain.handle('totp:generateSecret', async () => {
    return totp.generateSecret();
  });

  ipcMain.handle(
    'totp:verifyToken',
    async (_event, secret: string, token: string) => {
      return totp.verifyToken(secret, token);
    },
  );

  // Add this with the other IPC handlers
  ipcMain.handle('app:relaunch', () => {
    app.relaunch();
    app.exit(0);
  });
};

/**
 * Add event listeners...
 */

// Add this function to force cleanup all resources
function forceCleanup() {
  try {
    // Close all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.closeDevTools();
        window.destroy();
      }
    });

    // Reset mainWindow reference
    mainWindow = null;

    // Force garbage collection
    if (global.gc) global.gc();

    // Optional: Clear any cached data
    if (app.isPackaged) {
      app.clearCache();
    }
  } catch (error) {
    log.error('Error during cleanup:', error);
  }
}

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  forceCleanup();
  app.quit();
});

app.on('before-quit', (event) => {
  log.info('App is about to quit');
  event.preventDefault();
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
