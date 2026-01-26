import React, { useState } from 'react';
import { AppState, User } from '../types.ts';
import { authService } from '../services/authService.ts';
import { GlobeIcon, BoltIcon } from './Icons.tsx';

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
  onCancel?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ state, onSwitchMode, onSuccess, onCancel }) => {
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
        await new Promise(resolve => setTimeout(resolve, 800));
        const socialUser: User = {
            id: `social-${Date.now()}`,
            name: `${provider} User`,
            email: `user@${provider.toLowerCase()}.com`
        };
        localStorage.setItem('global_comp_session', JSON.stringify(socialUser));
        onSuccess(socialUser);
    } catch (err) {
        setError(`Failed to authenticate with ${provider}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden animate-fade-in">
        {onCancel && (
          <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <BoltIcon className="w-6 h-6 rotate-45" />
          </button>
        )}
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-400/10 rounded-2xl shadow-lg mb-4 border border-primary-400/20">
            <GlobeIcon className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isSignUp ? 'Establish Identity' : 'Authorized Access'}
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {isSignUp ? 'Join the Global Analytics Dossier' : 'Resuming Encrypted Session'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-800"
                placeholder="Senior Analyst Name"
                required={isSignUp}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Vector</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-800"
              placeholder="analyst@global-intel.io"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Passkey</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-xl shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? 'Create Dossier' : 'Authorize Login'}
                <BoltIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-4 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Partner Sync</span>
            <div className="flex-1 border-t border-slate-800"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all"><GoogleIcon /></button>
            <button onClick={() => handleSocialLogin('Microsoft')} className="flex items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all"><MicrosoftIcon /></button>
            <button onClick={() => handleSocialLogin('Apple')} className="flex items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-all"><AppleIcon /></button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onSwitchMode(isSignUp ? AppState.SIGN_IN : AppState.SIGN_UP)}
            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary-400 transition-colors"
          >
            {isSignUp ? 'Already registered? Login' : 'Need authorization? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};