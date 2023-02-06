import { BrowserWindow, Notification, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { eCom } from '../enums/communications';
import { checkDirectory } from './helpers';
import { Process } from './process';

const tmpDir = path.join(os.homedir(), '.debrepacker', '.tmp');
const outDir =
  process.env.OUT_DIR || path.join(os.homedir(), '.debrepacker', 'files');
export class Converter {
  private _filePath: string;
  private _filename: string;
  private _tmpFile: string;
  private _outputFileName: string;
  private _process = new Process(tmpDir);
  notification: Notification = new Notification({ icon: './assets/icon.png' });

  constructor(private _browserWin: BrowserWindow) {}

  set filePath(p: string) {
    this._filePath = p;
    this._filename = path.basename(this._filePath);
    this._tmpFile = path.join(tmpDir, this._filename);
    this._outputFileName = path.join(outDir, 'repacked_' + this._filename);
    checkDirectory(outDir, tmpDir);
  }

  async cancel() {
    this._process.cancel();
    await this.cleanup();
  }

  send<T = string>(type: eCom, payload?: T) {
    this._browserWin.webContents.send(type, payload);
  }

  start() {
    this.send(eCom.PROCESS_START);
    if (!this._filePath) {
      this.send(eCom.PROCESS_ERROR, 'No file selected');
      return;
    }
    fs.createReadStream(this._filePath)
      .pipe(fs.createWriteStream(this._tmpFile))
      .on('finish', async () => {
        try {
          await this._process.exec(`ar x ${this._filename}`);
          console.log(fs.readdirSync(tmpDir));
          const hasZstd = fs
            .readdirSync(tmpDir)
            .some((file) => file.includes('.zst'));
          if (!hasZstd) {
            await this.cleanup();
            this.send(eCom.PROCESS_ERROR, 'File could not be repacked');
            throw new Error('File could not be repacked');
          }
          await this._process.exec(
            'zstd -d < control.tar.xz | xz > control.tar.xz'
          );
          await this._process.exec('zstd -d < data.tar.zst | xz > data.tar.xz');
          await this._process.exec(
            `ar -m -c -a sdsd ${this._outputFileName} debian-binary control.tar.xz data.tar.xz`
          );
          // Move file to default destination
          // cleanup
          await this.cleanup();
          // Reveal file in the file explorer
          await this.revealInFileExplore();
          this.notification.title = 'Success';
          this.notification.body = 'File has been repacked';
          this.notification.show();
          this.send(eCom.PROCESS_END, this._outputFileName);
        } catch (error) {
          this.send(eCom.PROCESS_ERROR, error.message);
        }
      });
  }

  async cleanup() {
    await this._process.exec(
      `rm -rf ${tmpDir}/*.xz ${tmpDir}/*.zst debian-binary ${this._tmpFile}`
    );
  }

  async revealInFileExplore() {
    shell.openPath(outDir);
  }
}
