import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import LoginView from './views/LoginView';
import AdminDashboard from './views/AdminDashboard';
import StudentDashboard from './views/StudentDashboard';
import { ToastProvider } from './context/ToastContext';

import { supabase } from './services/supabaseClient';

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setUser(data as User);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={(u) => setUser(u)} />;
  }

  return user.role === UserRole.ADMIN ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} />
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