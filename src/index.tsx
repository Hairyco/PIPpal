import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { inject } from '@vercel/analytics';

inject();

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);