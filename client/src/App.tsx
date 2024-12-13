import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import Routes from './routes/routes';

const AppRoutes: React.FC = () => {
  const element = useRoutes(Routes); 
  return element;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
