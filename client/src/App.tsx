import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes, useNavigate } from 'react-router-dom';
import { setNavigator } from './utils/navigationService';
import { ToastContainer } from 'react-toastify';
import Routes from './routes/routes';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import 'react-toastify/dist/ReactToastify.css';

const AppRoutes: React.FC = () => {
  const element = useRoutes(Routes);
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  
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
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App;
