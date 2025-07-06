import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Register from './pages/Signup';
import Login from './pages/Login';
import Products from './pages/Products';

const Authenticated = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (token && (location.pathname === '/' || location.pathname === '/register')) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/register"
          element={
            <Authenticated>
              <Register />
            </Authenticated>
          }
        />
        <Route
          path="/"
          element={
            <Authenticated>
              <Login />
            </Authenticated>
          }
        />
        <Route
          path="/products"
          element={token ? <Products /> : <Navigate to="/" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/products" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;