import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import AppProviders from './app/AppProviders';
import ErrorBoundary from './app/components/ErrorBoundary';
import './styles/base.css';
import './styles/design.css';
import './styles/motion.css';
import './styles/brand.css';
import './styles/downloads.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
