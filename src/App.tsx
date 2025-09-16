import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Vaults from './pages/Vaults.tsx';
import Analytics from './pages/Analytics.tsx';
import Transactions from './pages/Transactions.tsx';
import TrustedThirdParties from './pages/TrustedThirdParties.tsx';
import Notifications from './pages/Notifications.tsx';
import Settings from './pages/Settings.tsx';
import AcceptInvitation from './pages/AcceptInvitation.tsx';
import ApproveWithdrawal from './pages/ApproveWithdrawal.tsx';

function App() {
  const handleLogout = () => {
    
    console.log('nada');
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/signup" element={<Signup onLogin={() => {}} />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
            <Route path="/vaults" element={<Vaults onLogout={handleLogout} />} />
            <Route path="/analytics" element={<Analytics onLogout={handleLogout} />} />
            <Route path="/transactions" element={<Transactions onLogout={handleLogout} />} />
            <Route path="/trusted-parties" element={<TrustedThirdParties onLogout={handleLogout} />} />
            <Route path="/notifications" element={<Notifications onLogout={handleLogout} />} />
            <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
            <Route path="/accept-invitation" element={<AcceptInvitation/>} />
            <Route path="/approve-withdrawal" element={<ApproveWithdrawal/>} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;