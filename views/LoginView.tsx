import React, { useState } from 'react';
import { Button, Input, Card } from '../components/UI';
import { useToast } from '../context/ToastContext';
import { MOCK_USERS } from '../mockData';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      
      // Password check simulation (hardcoded for demo)
      const validPassword = user?.role === 'ADMIN' ? 'admin123' : 'alumno123';
      
      if (user && password === validPassword) {
        addToast('success', `Welcome back, ${user.full_name}`);
        onLogin(user);
      } else {
        addToast('error', 'Invalid credentials. Try demo accounts.');
      }
      setIsLoading(false);
    }, 1000);
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
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your workouts</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email" 
            type="email" 
            placeholder="admin@openperk.com"
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
            Sign In
          </Button>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Demo Credentials:</p>
            <div className="flex justify-between">
              <span>Admin: admin@openperk.com</span>
              <span>admin123</span>
            </div>
            <div className="flex justify-between">
              <span>Student: alumno@openperk.com</span>
              <span>alumno123</span>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginView;
