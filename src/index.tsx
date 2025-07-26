import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ← IMPORTANT: This line must be here
import App from './App';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
