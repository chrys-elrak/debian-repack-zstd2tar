import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';

const App = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isCanceling, setIsCanceling] = React.useState<boolean>(false);
  const [file, setFile] = React.useState<File>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleFile = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files) {
        setFile(files[0]);
      }
    },
    [file]
  );

  const handleDragEnter = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      divRef.current?.classList.add('bg-blue-800');
    },
    []
  );

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) {
      return;
    }
    const files = e.dataTransfer.files;
    if (!files.length) {
      return;
    }
    const f = files[0];
    if (f.type !== 'application/vnd.debian.binary-package') {
      // TODO: show error
      return;
    }
    setFile(f);
  }, []);

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      divRef.current?.classList.remove('bg-blue-800');
    },
    []
  );

  function handleClick() {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }

  function handleCancel() {
    if (!confirm('Are you sure you want to cancel?')) {
      return;
    }
    setIsCanceling(true);
    window.electronAPI.cancel();
  }

  function _loadFile() {
    if (!confirm('Are you sure you want to load this file?')) {
      return;
    }
    window.electronAPI.process(file.path);
  }

  // listen to electron events
  React.useEffect(() => {
    window.electronAPI.onProcessStart(() => {
      setLoading(true);
      enqueueSnackbar('Loading file...', { variant: 'info' });
    });
    window.electronAPI.onProcessEnd(() => {
      setLoading(false);
      enqueueSnackbar('File successfully loaded', { variant: 'success' });
      // setOutputFile(outputFile);
    });
    window.electronAPI.onProcessError(() => {
      setLoading(false);
      enqueueSnackbar('Error loading file', { variant: 'error' });
    });
    window.electronAPI.onProcessCanceled(() => {
      setLoading(false);
      setIsCanceling(false);
      enqueueSnackbar('Process canceled', { variant: 'error' });
    });
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-black opacity-80 flex flex-col items-center justify-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          <h2 className="text-center text-white text-xl font-semibold">
            Loading...
          </h2>
          <p className="w-1/3 text-center text-white">
            This may take a few seconds, please don't close the app.
          </p>
          <button
            onClick={handleCancel}
            disabled={isCanceling}
            className="bg-red-600 h-10 mt-3 w-auto px-10 text-white opacity-100"
          >
            Cancel
          </button>
        </div>
      )}
      <input
        accept=".deb"
        onInput={(e) => handleFile(e)}
        type="file"
        ref={fileRef}
        className="hidden"
      />
      <div className="flex items-center justify-center h-screen bg-blue-900 text-white relative">
        {/* <IconButton className='absolute' id="composition-button"
                    aria-controls={open ? 'composition-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle} ref={anchorRef} >
                    <SettingsIcon className='text-white' />
                </IconButton>
                <PopperMenu setOpen={setOpen} open={open} anchorRef={anchorRef} /> */}
        <div
          ref={divRef}
          className="w-9/12 h-96 border-2 border-dashed border-white-800 justify-center flex-col flex"
          onDragLeave={(e) => handleDragLeave(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => e.preventDefault()}
        >
          <h3 className="text-center">Drop file here</h3>
          <p className="flex justify-center">or</p>
          <div className="mt-5 flex content-center justify-center">
            <Button
              className="w-1/2"
              variant="contained"
              disabled={loading}
              onClick={handleClick}
              color="success"
            >
              Select file
            </Button>
          </div>
          {file && (
            <div className="mt-5">
              <div className="text-center size text-xs">
                <pre>{file.name}</pre>
              </div>
              <div className="mt-5 flex content-center justify-center space-x-5">
                <Button
                  className="self-center"
                  variant="contained"
                  disabled={loading}
                  onClick={_loadFile}
                  color="primary"
                >
                  Start
                </Button>
                <Button
                  className="self-center"
                  variant="text"
                  disabled={loading}
                  onClick={() => setFile(null)}
                  color="error"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
  <SnackbarProvider>
    <App />
  </SnackbarProvider>
);
