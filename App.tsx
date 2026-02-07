import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginView from './views/LoginView';
import AdminDashboard from './views/AdminDashboard';
import StudentDashboard from './views/StudentDashboard';
import { ToastProvider } from './context/ToastContext';

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persisted session
    const stored = localStorage.getItem('openperk_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('openperk_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('openperk_user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('openperk_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return user.role === UserRole.ADMIN ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;