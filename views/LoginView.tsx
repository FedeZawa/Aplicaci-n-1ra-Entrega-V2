import React, { useState } from 'react';
import { Button, Input, Card } from '../components/UI';
import { useToast } from '../context/ToastContext';
import { MOCK_USERS } from '../mockData';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

import { supabase } from '../services/supabaseClient';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        // --- REGISTER ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName } // Recovered by trigger in DB
          }
        });

        if (error) throw error;

        if (data.user) {
          addToast('success', 'Registration successful. Welcome to OpenPerk!');
          // Profile is created by trigger, App.tsx will pick up the session
        }
      } else {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          addToast('success', 'Logged in successfully');
        }
      }
    } catch (err: any) {
      addToast('error', err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

      <Card className="w-full max-w-md relative z-10 border-slate-700/50 bg-slate-900/90 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <i className="fas fa-dumbbell text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OpenPerk</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isRegister ? 'Create your professional account' : 'Sign in to manage your workouts'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegister && (
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full py-3" isLoading={isLoading}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginView;
