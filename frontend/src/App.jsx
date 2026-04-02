import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const GlobalLoader = () => (
  <div style={{ display:'flex', flexDirection: 'column', gap: '16px', alignItems:'center', justifyContent:'center', height:'100vh', background: 'var(--ink)' }}>
    <div style={{ width: 40, height: 40, border: '3px solid rgba(201, 168, 76, 0.2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '15px', letterSpacing: '3px', fontWeight: '700', animation: 'fadeIn 1s ease forwards' }}>DASH</span>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <GlobalLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <GlobalLoader />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}