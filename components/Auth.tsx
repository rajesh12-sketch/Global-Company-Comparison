import React, { useState } from 'react';
import { AppState, User } from '../types';
import { authService } from '../services/authService';
import { GlobeIcon, BoltIcon } from './Icons';

// Social Media Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.9 4.31-.68c.75.03 1.86.3 2.58 1.25-.09.04-1.57.88-1.54 2.82.03 2.14 1.94 2.92 2.06 2.97-1.74 3.59-2.22 4.41-2.49 5.87zM13 3.5c.98 0 1.92.56 2.27 1.57-1.16.89-2.66.56-3.41-.63-.5-1.04.14-2.31 1.14-2.31z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 23 23" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f3f3f3" d="M0 0h23v23H0z" fillOpacity="0" />
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

interface AuthProps {
  state: AppState.SIGN_IN | AppState.SIGN_UP;
  onSwitchMode: (mode: AppState.SIGN_IN | AppState.SIGN_UP) => void;
  onSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ state, onSwitchMode, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = state === AppState.SIGN_UP;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required");
        const user = await authService.signUp(name, email, password);
        onSuccess(user);
      } else {
        const user = await authService.signIn(email, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setError(null);
    setLoading(true);
    
    try {
        // Simulate a network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create a mock user based on the provider
        const socialUser: User = {
            id: `social-${Date.now()}`,
            name: `${provider} User`,
            email: `user@${provider.toLowerCase()}.com`
        };
        
        // In a real app, this would redirect to OAuth provider
        // For this demo, we'll just log them in immediately using our mock auth service logic
        localStorage.setItem('global_comp_session', JSON.stringify(socialUser));
        onSuccess(socialUser);

    } catch (err) {
        setError(`Failed to authenticate with ${provider}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-xl shadow-lg mb-4">
            <GlobeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {isSignUp ? 'Join the global analysis platform' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                placeholder="John Doe"
                required={isSignUp}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-primary-900/50 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? 'Sign Up' : 'Sign In'}
                <BoltIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Divider & Buttons */}
        <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-4 text-xs text-slate-500 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-slate-800"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <button 
                type="button" 
                onClick={() => handleSocialLogin('Google')} 
                disabled={loading}
                className="flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign in with Google"
            >
                <GoogleIcon />
            </button>
            <button 
                type="button" 
                onClick={() => handleSocialLogin('Microsoft')} 
                disabled={loading}
                className="flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign in with Microsoft"
            >
                <MicrosoftIcon />
            </button>
            <button 
                type="button" 
                onClick={() => handleSocialLogin('Apple')} 
                disabled={loading}
                className="flex items-center justify-center p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sign in with Apple"
            >
                <AppleIcon />
            </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setError(null);
                onSwitchMode(isSignUp ? AppState.SIGN_IN : AppState.SIGN_UP);
              }}
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
      
      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};