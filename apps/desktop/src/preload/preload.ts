import { contextBridge, ipcRenderer } from 'electron';

export interface IElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, listener: (...args: any[]) => void) => () => void;
  send: (channel: string, ...args: any[]) => void;
  isElectron: boolean;
}

const api: IElectronAPI = {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: any[]) => void) => {
    const handler = (_event: any, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  isElectron: true
};

contextBridge.exposeInMainWorld('electronAPI', api);
