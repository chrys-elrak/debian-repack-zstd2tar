import { app, BrowserWindow, ipcMain, Menu } from "electron";
import dotenv from "dotenv";
import { Converter } from "./core/converter";
import { eCom } from "./enums/communications";
import { createWindow } from "./core/helpers";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env",
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow;
function createMainWindow() {
  mainWindow = createWindow(
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    MAIN_WINDOW_WEBPACK_ENTRY,
  );
  const menu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(menu);
}

app.on("ready", createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// let tray: Tray = null;
app.whenReady()
  .then(() => {
    const converter = new Converter(mainWindow);
    ipcMain.handle(eCom.CALL_PROCESS, async (_, filePath: string) => {
      converter.filePath = filePath;
      converter.start();
    });
    ipcMain.handle(eCom.CALL_CANCEL, async () => {
      await converter.cancel();
    });
    ipcMain.handle(eCom.CALL_REVEAL_FILE, async (_, filePath: string) => {
      console.log("reveal file", filePath);
    });
  })
  .then(() => {
    // Prevent memory leaks
    mainWindow.on("close", () => {
      mainWindow.destroy();
      mainWindow = null;
    });
  });
