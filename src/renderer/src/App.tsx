import * as React from 'react';
import Versions from './components/Versions';
import electronLogo from './assets/electron.svg';

function App(): React.JSX.Element {
  const ipcHandle = (): void => {
    window.electron.ipcRenderer.send('ping');
  };

  const address = 'http://localhost:8080/';

  const apiHandle = async (): Promise<void> => {
    await fetch(address, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-cache',
    })
      .then((res) => res.json())
      .then((data) => {
		if (document.querySelector('div.text'))
		  document.querySelector('div.text')!.textContent = data?.message ?? 'no data';
      })
      .catch((error) => {
        console.error("fetch-error", error);
      });
    //window.electron.ipcRenderer.send('notification', 'http://localhost:8080');
  };

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={apiHandle}>
            Fetch API ({address})
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  );
}

export default App;
