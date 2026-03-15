import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Palette, 
  Brain, 
  CheckCircle2,
  Building2,
  Globe,
  MessageSquare,
  Rocket
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, FUEL_DROP_BRANDING } from '../types';

interface Props {
  uid: string;
  onComplete: (profile: UserProfile) => void;
}

type Step = 'welcome' | 'branding' | 'ai-training' | 'finalizing';

export const Onboarding: React.FC<Props> = ({ uid, onComplete }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(() => {
    const guestEmail = window.localStorage.getItem('guestEmail') || '';
    return {
      uid,
      companyName: '',
      website: '',
      branding: {
        primaryColor: FUEL_DROP_BRANDING.primary,
        logoUrl: ''
      },
      aiConfig: {
        toneOfVoice: 'Professional & Persuasive',
        companyBackground: ''
      }
    };
  });

  const handleComplete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const finalProfile = {
        ...profileData,
        updatedAt: new Date()
      } as UserProfile;

      await setDoc(doc(db, 'users', uid), finalProfile);
      onComplete(finalProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
              <div className="relative p-6 bg-white rounded-[40px] shadow-2xl border border-emerald-50">
                <Droplets className="w-20 h-20 text-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
                Welcome to the <br />
                <span className="text-emerald-500">Fuel Drop</span> Engine
              </h1>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                Let's configure your high-performance proposal environment in under 60 seconds.
              </p>
            </div>

            <button
              onClick={() => setStep('branding')}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              Start Configuration
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        );

      case 'branding':
        return (
          <motion.div 
            key="branding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10 w-full max-w-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Visual Identity</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step 01 / 03</p>
              </div>
            </div>

            <div className="grid gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Company Name
                </label>
                <input
                  type="text"
                  value={profileData.companyName}
                  onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                  placeholder="e.g. Fuel Drop Northern Territory"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Website URL
                </label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  placeholder="https://fueldrop.com.au"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Brand Color</label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <input
                    type="color"
                    value={profileData.branding?.primaryColor}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      branding: { ...profileData.branding!, primaryColor: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                  />
                  <span className="font-mono font-bold text-slate-400 uppercase">{profileData.branding?.primaryColor}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('ai-training')}
              disabled={!profileData.companyName}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
            >
              Continue to AI Training
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 'ai-training':
        return (
          <motion.div 
            key="ai-training"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10 w-full max-w-xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Train Your AI</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step 02 / 03</p>
              </div>
            </div>

            <div className="grid gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Tone of Voice
                </label>
                <select
                  value={profileData.aiConfig?.toneOfVoice}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    aiConfig: { ...profileData.aiConfig!, toneOfVoice: e.target.value }
                  })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 appearance-none"
                >
                  <option>Professional & Persuasive</option>
                  <option>Bold & Disruptive</option>
                  <option>Technical & Precise</option>
                  <option>Friendly & Approachable</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Company Background
                </label>
                <textarea
                  value={profileData.aiConfig?.companyBackground}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    aiConfig: { ...profileData.aiConfig!, companyBackground: e.target.value }
                  })}
                  placeholder="Tell us about your services, mission, and unique value proposition..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 min-h-[160px] resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => setStep('finalizing')}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              Review & Launch
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        );

      case 'finalizing':
        return (
          <motion.div 
            key="finalizing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-10 w-full max-w-md"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
              <div className="relative p-8 bg-white rounded-[40px] shadow-2xl border border-emerald-50">
                <Rocket className="w-16 h-16 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">All Systems Go</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                Your world-class proposal engine is ready to launch. We've configured your branding and trained the AI on your business DNA.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Branding Configured
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                AI Model Trained
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Enterprise Security Active
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Launch Dashboard
                  <Rocket className="w-6 h-6" />
                </>
              )}
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {step !== 'welcome' && step !== 'finalizing' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          {(['branding', 'ai-training'] as Step[]).map((s) => (
            <div 
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === s ? 'w-12 bg-emerald-500' : 'w-3 bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
