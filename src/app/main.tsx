import App from '@/app/App';
import { registerServiceWorker } from '@/shared/lib/push';
import '@/shared/styles/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Register SW eagerly (permission prompt will be handled by initPushForUser)
registerServiceWorker();
