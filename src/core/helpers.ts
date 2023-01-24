import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import fs from "node:fs";
export function checkDirectory(...pathDirs: string[]) {
  for (const pathDir of pathDirs) {
    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir, { recursive: true });
    }
  }
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}

export function createWindow(
  preload: string,
  url: string,
  options: BrowserWindowConstructorOptions = {},
) {
  const mainWindow = new BrowserWindow({
    height: 730,
    width: 840,
    minHeight: 500,
    minWidth: 400,
    webPreferences: {
      preload: preload,
      devTools: isDev(),
      defaultEncoding: "utf-8",
      webgl: false,
      spellcheck: false,
      enablePreferredSizeMode: true,
    },
    ...options,
  });

  mainWindow.loadURL(url);
  isDev && mainWindow.webContents.openDevTools();
  return mainWindow;
}
