import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TellerDashboard from './pages/TellerDashboard';
import ClientDashboard from './pages/ClientDashboard';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/teller" element={<ProtectedRoute roles={['BANK_TELLER', 'ADMIN']}><TellerDashboard /></ProtectedRoute>} />
      <Route path="/client" element={<ProtectedRoute roles={['CLIENT', 'ADMIN', 'BANK_TELLER']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/admin" /> :
          user.role === 'BANK_TELLER' ? <Navigate to="/teller" /> :
          <Navigate to="/client" />
        ) : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
