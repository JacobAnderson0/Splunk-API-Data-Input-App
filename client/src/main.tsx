import React from 'react';
import ReactDOM from 'react-dom/client';
import { SplunkThemeProvider } from '@splunk/themes';
import NewDataInput from './dashboards/NewDataInput';
import Home from './dashboards/Home';

const dashboardElements = document.querySelectorAll('[data-dashboard]');

dashboardElements.forEach((el) => {
  const dashboardType = el.getAttribute('data-dashboard');
  const renderApp = () => {
    switch (dashboardType) {
      case 'new-data-input':
        return <NewDataInput />;
      case 'home':
        return <Home />;
      default:
        return <NewDataInput />;
    }
  };

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <SplunkThemeProvider family="enterprise" colorScheme="light" density="compact">
        {renderApp()}
      </SplunkThemeProvider>
    </React.StrictMode>
  );
});
