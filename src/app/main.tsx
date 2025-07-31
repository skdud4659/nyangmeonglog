import App from '@/app/App';
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
