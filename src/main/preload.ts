// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel: string, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['update-downloaded', 'update-error', 'download-progress'];
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      return () => {};
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, func);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  // Add authentication-related methods
  auth: {
    generateTOTP: () => ipcRenderer.invoke('auth:generateTOTP'),
    verifyTOTP: (token: string, secret: string) =>
      ipcRenderer.invoke('auth:verifyTOTP', token, secret),
    hashPassword: (password: string) =>
      ipcRenderer.invoke('auth:hashPassword', password),
    verifyPassword: (password: string, hash: string) =>
      ipcRenderer.invoke('auth:verifyPassword', password, hash),
  },
  crypto: {
    hashPassword: (password: string) =>
      ipcRenderer.invoke('crypto:hashPassword', password),
    verifyPassword: (password: string, hash: string) =>
      ipcRenderer.invoke('crypto:verifyPassword', password, hash),
    generateRandomString: (length: number) =>
      ipcRenderer.invoke('crypto:generateRandomString', length),
  },
  totp: {
    generateSecret: () => ipcRenderer.invoke('totp:generateSecret'),
    verifyToken: (token: string, secret: string) =>
      ipcRenderer.invoke('totp:verifyToken', token, secret),
  },
});
