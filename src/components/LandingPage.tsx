import React from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  Zap, 
  Shield, 
  ArrowRight,
  Droplets,
  FileText,
  Sparkles,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';
import { FUEL_DROP_BRANDING } from '../types';

interface Props {
  onStart: () => void;
  isAuthLoading: boolean;
}

export const LandingPage: React.FC<Props> = ({ onStart, isAuthLoading }) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navigation Rail */}
      <div className="fixed left-0 top-0 h-full w-16 border-r border-slate-200 bg-white z-50 hidden lg:flex flex-col items-center py-8 gap-8">
        <div className="p-2 rounded-lg bg-emerald-500 text-white">
          <Droplets className="w-6 h-6" />
        </div>
        <div className="flex-1 flex flex-col gap-6 text-slate-400">
          <Globe className="w-5 h-5" />
          <BarChart3 className="w-5 h-5" />
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest rotate-180 [writing-mode:vertical-rl] text-slate-300">
          Fuel Drop v2.0
        </div>
      </div>

      {/* Hero Section */}
      <main className="lg:ml-16">
        <div className="relative min-h-screen flex flex-col lg:flex-row">
          {/* Left Pane: Content */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-20 bg-white">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-8 w-fit"
            >
              <Sparkles className="w-3 h-3" />
              Next-Gen Proposal Engine
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[80px] sm:text-[112px] font-black italic uppercase tracking-tighter text-slate-900 leading-[0.85] mb-8"
            >
              Close <br />
              <span className="text-emerald-500">Bigger</span> <br />
              Deals.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-md text-lg text-slate-500 mb-12 leading-relaxed"
            >
              The world's first AI-powered proposal generator built specifically for the fuel and energy industry. Professional, branded, and ready in seconds.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <button
                onClick={onStart}
                disabled={isAuthLoading}
                className="group relative px-10 py-5 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 overflow-hidden"
              >
                <span className="relative z-10">Launch Engine</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <Shield className="w-4 h-4 text-emerald-500" />
                Enterprise Grade Security
              </div>
            </motion.div>
          </div>

          {/* Right Pane: Visual/Split */}
          <div className="flex-1 bg-slate-900 relative overflow-hidden hidden lg:block">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981_0%,transparent_50%)]" />
            </div>
            
            {/* Floating Feature Cards */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: -5 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-32 -left-16 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 w-64"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Instant Quotes</h4>
                  <p className="text-xs text-slate-500">Generate 5000L+ bulk orders in under 10 seconds.</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 5 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-32 -right-16 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 w-64"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Brand Perfect</h4>
                  <p className="text-xs text-slate-500">Automatic logo & color injection for every PDF.</p>
                </motion.div>

                {/* Central Visual */}
                <div className="p-8 bg-slate-800/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-4 w-1/3 bg-white/10 rounded-full" />
                    <div className="h-20 w-full bg-white/5 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-12 bg-emerald-500/20 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bento Grid */}
        <section className="py-32 px-8 sm:px-16 lg:px-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">
                Engineered for <span className="text-emerald-500">Performance.</span>
              </h2>
              <p className="text-slate-500 max-w-xl">Built by industry experts to solve the real-world challenges of fuel logistics and sales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 p-10 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-emerald-500 transition-all duration-500">
                <BarChart3 className="w-10 h-10 text-emerald-500 mb-6 group-hover:text-white" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-white">Advanced Analytics</h3>
                <p className="text-slate-500 group-hover:text-emerald-50 text-lg">Track proposal acceptance rates, total contract values, and sales performance in real-time.</p>
              </div>
              <div className="md:col-span-4 p-10 bg-slate-900 rounded-[32px] text-white">
                <Lock className="w-10 h-10 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Secure Storage</h3>
                <p className="text-slate-400">Every quote is encrypted and stored in our secure cloud repository.</p>
              </div>
              <div className="md:col-span-4 p-10 bg-white rounded-[32px] border border-slate-200">
                <Globe className="w-10 h-10 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Territory Wide</h3>
                <p className="text-slate-500">Built specifically for the unique challenges of Northern Territory operations.</p>
              </div>
              <div className="md:col-span-8 p-10 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-emerald-900 mb-2">Ready to scale?</h3>
                  <p className="text-emerald-700">Join 50+ Territory businesses closing more deals.</p>
                </div>
                <button 
                  onClick={onStart}
                  className="relative z-10 w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
                <Droplets className="absolute -right-10 -bottom-10 w-48 h-48 text-emerald-200/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 sm:px-16 lg:px-24 border-t border-slate-100 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500 text-white">
              <Droplets className="w-3 h-3" />
            </div>
            <span className="text-slate-900">Fuel Drop Engine</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
          </div>
          <div>© 2026 Fuel Drop. All Rights Reserved.</div>
        </footer>
      </main>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);
