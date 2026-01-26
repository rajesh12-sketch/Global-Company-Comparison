import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { authService } from '../services/authService.ts';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, ChevronLeftIcon, BoltIcon } from './Icons.tsx';

interface AccountProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const Account: React.FC<AccountProps> = ({ user, onUpdateUser, onBack, onLogout }) => {
  const [formData, setFormData] = useState<User>(user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.name.trim()) throw new Error("Name is required");
      if (!formData.email.trim()) throw new Error("Email is required");

      const updatedUser = await authService.updateProfile(formData);
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'Analyst Profile updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Identity update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-4 group"
          >
            <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Workspace
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Account Settings</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage Analyst Credentials & Identity</p>
        </div>
        <button 
          onClick={onLogout}
          className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-8 flex flex-col items-center text-center shadow-xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6 ring-4 ring-slate-800">
                  {initials}
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{user.name}</h2>
              <p className="text-slate-500 text-xs font-bold mt-1 tracking-widest uppercase">{user.email}</p>
              
              <div className="mt-10 w-full space-y-4 text-left">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <BriefcaseIcon className="w-5 h-5 text-indigo-400" />
                      <span>{user.jobTitle || 'Role Undefined'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <MapPinIcon className="w-5 h-5 text-emerald-400" />
                      <span>{user.address || 'Geo-Location Undefined'}</span>
                  </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 shadow-xl">
                <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                    <UserCircleIcon className="w-5 h-5 text-primary-400" />
                    Identity Dossier
                </h3>

                {message && (
                    <div className={`mb-8 p-5 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-xs font-bold animate-fade-in`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                            <div className="relative">
                                <UserCircleIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-700" />
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Role</label>
                            <div className="relative">
                                <BriefcaseIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-700 pointer-events-none" />
                                <select 
                                    name="jobTitle"
                                    value={formData.jobTitle || ''}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold appearance-none"
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="Investor">Private Investor</option>
                                    <option value="Analyst">Market Analyst</option>
                                    <option value="Executive">Corporate Executive</option>
                                    <option value="Founder">Entity Founder</option>
                                    <option value="Other">Strategic Consultant</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Coordinate (Email)</label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-700" />
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comms Line</label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-700" />
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Jurisdiction</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-700" />
                                <input 
                                    type="text" 
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    placeholder="New York, USA"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-xl shadow-2xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>Save Profile Identity <BoltIcon className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};