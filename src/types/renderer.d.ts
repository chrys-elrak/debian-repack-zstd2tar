import { IpcMainEvent } from "electron";
export interface IElectronAPI {
    onProcessStart: (cb: () => void) => void;
    onProcessCanceled: (cb: () => void) => void;
    onProcessEnd: (cb: (event: IpcMainEvent, outputFile?: string) => void) => void;
    onProcessError: (cb: (event: IpcMainEvent, error?: string) => void) => void;
    cancel: () => void;
    process: (path: string) => void;
    revealFile: (path: string) => Promise<void>;
}
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
