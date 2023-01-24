import { IElectronAPI } from './types/renderer.d';
import { eCom } from "./enums/communications";
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const buildContext = (params: IElectronAPI) => params;

contextBridge.exposeInMainWorld(
  "electronAPI",
  buildContext({
    process: (filePath: string) => {
      ipcRenderer.invoke(eCom.CALL_PROCESS, filePath);
    },
    cancel: () => {
      ipcRenderer.invoke(eCom.CALL_CANCEL);
    },
    revealFile: (filePath: string) => {
      return ipcRenderer.invoke(eCom.CALL_REVEAL_FILE, filePath);
    },
    onProcessStart: (cb: () => void) => {
      ipcRenderer.on(eCom.PROCESS_START, cb);
    },
    onProcessEnd: (cb) => {
      ipcRenderer.on(eCom.PROCESS_END, cb as never);
    },
    onProcessCanceled: (cb) => {
      ipcRenderer.on(eCom.PROCESS_CANCELED, cb as never);
    },
    onProcessError: function (cb): void {
      ipcRenderer.on(eCom.PROCESS_ERROR, cb as never);
    },
  }),
);
