export interface IpcRenderer {
  send: (channel: string, ...args: unknown[]) => void;
  on: (
    channel: string,
    func: (...args: unknown[]) => void,
  ) => (() => void) | undefined;
  once: (channel: string, func: (...args: unknown[]) => void) => void;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  removeListener: (channel: string, func: (...args: unknown[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

export interface Crypto {
  hashPassword: (password: string) => Promise<string>;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer;
      crypto: Crypto;
    };
    totp: {
      generateSecret: () => Promise<string>;
      verifyToken: (secret: string, token: string) => Promise<boolean>;
    };
  }
}

export {};
