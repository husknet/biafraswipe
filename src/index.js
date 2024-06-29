import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App, { Web3ModalProvider } from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Web3ModalProvider>
      <App />
    </Web3ModalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
