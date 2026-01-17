import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary message="The CRM encountered an error. Your data is saved locally and will be restored when you reload.">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
