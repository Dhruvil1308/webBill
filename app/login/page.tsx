'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-webbill-cream flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
         <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-webbill-burgundy/40 blur-[120px]" />
         <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-webbill-tan/40 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 rounded-2xl bg-webbill-burgundy flex items-center justify-center text-white shadow-2xl shadow-webbill-burgundy/20 mx-auto mb-6">
              <LayoutGrid size={32} />
           </div>
           <h1 className="text-3xl font-black tracking-tighter text-webbill-dark">WebBill Terminal</h1>
           <p className="text-webbill-muted font-bold text-xs uppercase tracking-[0.3em] mt-2">Enterprise Restaurant OS</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-white/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-webbill-muted mb-2 block ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-12 text-sm font-bold focus:ring-2 focus:ring-webbill-burgundy/20 focus:border-webbill-burgundy transition-all"
                  placeholder="name@restaurant.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-webbill-muted" size={18} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-webbill-muted mb-2 block ml-1">Secure Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-12 text-sm font-bold focus:ring-2 focus:ring-webbill-burgundy/20 focus:border-webbill-burgundy transition-all"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-webbill-muted" size={18} />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-webbill-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {loading ? (
                <>Authenticating... <Loader2 className="animate-spin" size={18} /></>
              ) : (
                <>Signature Login <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[9px] font-black text-webbill-muted uppercase tracking-widest opacity-40">Session secured by WebBill Cloud Protection</p>
        </div>
      </motion.div>
    </div>
  );
}
