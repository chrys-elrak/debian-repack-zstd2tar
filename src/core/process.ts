import child_process, {
  ChildProcessWithoutNullStreams,
} from 'node:child_process';
export class Process {
  currentProcess: ChildProcessWithoutNullStreams;

  constructor(private _workingDirectory: string) {}

  cancel() {
    if (this.currentProcess) {
      this.currentProcess.kill(3);
    }
  }

  exec(cmd: string): Promise<boolean | Error> {
    return new Promise((resolve, reject) => {
      this.currentProcess = child_process.spawn(cmd, [], {
        cwd: this._workingDirectory,
        shell: true,
      });
      console.log(`[${this.currentProcess.pid}] => ${cmd}`);
      this.currentProcess.on('exit', (code: number) => {
        if (code !== 0) {
          return reject(new Error(`Process exited with code ${code || 0}`));
        }
        return resolve(true);
      });
    });
  }
}
