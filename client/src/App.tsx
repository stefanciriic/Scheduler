import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import Routes from './routes/routes';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';

const AppRoutes: React.FC = () => {
  const element = useRoutes(Routes); 
  return element;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
