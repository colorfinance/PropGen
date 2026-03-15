import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Send, 
  Loader2, 
  Edit3, 
  Eye, 
  Droplets,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  History,
  LogOut,
  LogIn,
  User as UserIcon,
  X,
  LayoutDashboard,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Truck,
  Database,
  Droplet,
  Sparkles,
  Building2,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { generateProposalContent } from './services/gemini';
import { ProposalPreview } from './components/ProposalPreview';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { ProposalData, FUEL_DROP_BRANDING, UserProfile, ProposalStatus, ProposalTemplate, PricingItem } from './types';
import { PROPOSAL_TEMPLATES } from './constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  auth, 
  db, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc, 
  getDoc,
  getDocFromServer,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User
} from './firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) {
          errorMessage = `Database Error: ${parsed.error}`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Application Error</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<ProposalData[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');

  // Editor State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  // Custom Branding State
  const [primaryColor, setPrimaryColor] = useState(FUEL_DROP_BRANDING.primary);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const stats = {
    total: history.length,
    accepted: history.filter(p => p.status === 'accepted').length,
    pending: history.filter(p => p.status === 'sent' || p.status === 'draft').length,
    totalValue: history.reduce((acc, curr) => acc + (curr.value || 0), 0)
  };

  const filteredHistory = history.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Auth Listener
  React.useEffect(() => {
    // Connection Test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    // Handle Magic Link Sign-in
    const handleMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          setIsAuthLoading(true);
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // Clean up URL
            window.history.replaceState({}, '', window.location.pathname);
          } catch (error: any) {
            console.error('Magic link error:', error);
            alert('Error signing in with magic link: ' + error.message);
            setIsAuthLoading(false);
          }
        }
      }
    };
    handleMagicLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as UserProfile;
            setProfile(profileData);
            setPrimaryColor(profileData.branding.primaryColor);
            setLogoUrl(profileData.branding.logoUrl);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // History Listener
  React.useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'proposals'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProposalData[];
      setHistory(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'proposals');
    });

    return () => unsubscribe();
  }, [user]);

  const handleBypassLogin = async (email: string) => {
    setIsAuthLoading(true);
    try {
      // Sign in anonymously to get a UID
      const cred = await signInAnonymously(auth);
      // Store the email in localStorage so Onboarding can pick it up if needed, 
      // or we can just use it to initialize the profile
      window.localStorage.setItem('guestEmail', email);
      
      // Check if profile exists (unlikely for new anonymous user, but good for persistence)
      const profileDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!profileDoc.exists()) {
        // We'll let Onboarding handle the creation, but we've bypassed the "check your email" step
      }
    } catch (error: any) {
      console.error('Bypass login error:', error);
      alert('Error starting session: ' + error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProposal(null);
      resetBranding();
      setView('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetBranding = () => {
    setPrimaryColor(FUEL_DROP_BRANDING.primary);
    setLogoUrl(undefined);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !plan || !price) return;

    setIsGenerating(true);
    try {
      const content = await generateProposalContent(
        plan, 
        price, 
        clientName,
        profile?.aiConfig?.companyBackground,
        profile?.aiConfig?.toneOfVoice
      );
      
      const newProposal: ProposalData = {
        uid: user?.uid || '',
        clientName,
        clientEmail,
        value: parseFloat(estimatedValue) || 0,
        content,
        status: 'draft',
        date: new Date().toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        branding: {
          primaryColor,
          logoUrl
        },
        pricingItems
      };

      if (user) {
        try {
          const docRef = await addDoc(collection(db, 'proposals'), {
            ...newProposal,
            createdAt: serverTimestamp()
          });
          newProposal.id = docRef.id;
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'proposals');
        }
      }
      
      setProposal(newProposal);
      setActiveTab('preview');
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ProposalStatus) => {
    try {
      await updateDoc(doc(db, 'proposals', id), { status });
      if (proposal?.id === id) setProposal({ ...proposal, status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `proposals/${id}`);
    }
  };

  const applyTemplate = (t: ProposalTemplate) => {
    setPlan(t.defaultPlan);
    setPrice(t.defaultPrice);
  };

  const handleDeleteProposal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await deleteDoc(doc(db, 'proposals', id));
      if (proposal?.id === id) setProposal(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `proposals/${id}`);
    }
  };

  const handleLoadProposal = (p: ProposalData) => {
    setProposal(p);
    setClientName(p.clientName);
    setClientEmail(p.clientEmail || '');
    setPlan(''); // These are for generation, we load the content directly
    setPrice('');
    setEstimatedValue(p.value?.toString() || '');
    setPricingItems(p.pricingItems || []);
    setPrimaryColor(p.branding.primaryColor);
    setLogoUrl(p.branding.logoUrl);
    setActiveTab('preview');
    setView('editor');
  };

  const startNewProposal = () => {
    setProposal(null);
    setClientName('');
    setClientEmail('');
    setPlan('');
    setPrice('');
    setEstimatedValue('');
    setPricingItems([]);
    setActiveTab('edit');
    setView('editor');
  };

  const addPricingItem = () => {
    setPricingItems([...pricingItems, { description: '', quantity: 1, price: 0 }]);
  };

  const updatePricingItem = (index: number, field: keyof PricingItem, value: any) => {
    const newItems = [...pricingItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPricingItems(newItems);
    
    // Update estimated value automatically
    const total = newItems.reduce((acc, item) => {
      const price = Number.isNaN(item.price) ? 0 : item.price;
      const qty = Number.isNaN(item.quantity) ? 0 : item.quantity;
      return acc + (price * qty);
    }, 0);
    setEstimatedValue(total.toString());
  };

  const removePricingItem = (index: number) => {
    setPricingItems(pricingItems.filter((_, i) => i !== index));
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`FuelDrop_Proposal_${clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user && !isAuthLoading) {
    return <LandingPage onStart={handleBypassLogin} isAuthLoading={isAuthLoading} />;
  }

  if (user && !profile && !isAuthLoading) {
    return (
      <Onboarding 
        uid={user.uid} 
        onComplete={(p) => {
          setProfile(p);
          setPrimaryColor(p.branding.primaryColor);
          setLogoUrl(p.branding.logoUrl);
          setView('dashboard');
        }} 
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] flex text-gray-900 font-sans">
      {/* Sidebar Navigation Rail */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="text-xl font-black italic uppercase tracking-tighter hidden lg:block">
            Fuel <span className="text-emerald-500">Drop</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              view === 'dashboard' ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block">Dashboard</span>
          </button>
          <button
            onClick={startNewProposal}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
              view === 'editor' ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden lg:block">New Proposal</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all group">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hidden lg:block"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            {view === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 mb-2">
                      Sales <span className="text-emerald-500">Overview</span>
                    </h1>
                    <p className="text-gray-500">Track your performance and manage your pipeline.</p>
                  </div>
                  <button
                    onClick={startNewProposal}
                    className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200"
                  >
                    <Plus className="w-5 h-5" />
                    Create Proposal
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label="Total Value" 
                    value={`$${stats.totalValue.toLocaleString()}`} 
                    icon={<TrendingUp className="w-5 h-5" />}
                    trend="+12% from last month"
                    color="emerald"
                  />
                  <StatCard 
                    label="Accepted" 
                    value={stats.accepted} 
                    icon={<CheckCircle className="w-5 h-5" />}
                    trend={`${Math.round((stats.accepted / (stats.total || 1)) * 100)}% conversion`}
                    color="blue"
                  />
                  <StatCard 
                    label="Pending" 
                    value={stats.pending} 
                    icon={<Clock className="w-5 h-5" />}
                    trend="Requires follow-up"
                    color="amber"
                  />
                  <StatCard 
                    label="Total Proposals" 
                    value={stats.total} 
                    icon={<FileText className="w-5 h-5" />}
                    trend="Active pipeline"
                    color="slate"
                  />
                </div>

                {/* History Table */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-400" />
                      Proposal History
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          type="text"
                          placeholder="Search clients..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-emerald-500 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-gray-600"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Client</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Value</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredHistory.map((p) => (
                          <tr 
                            key={p.id} 
                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                            onClick={() => handleLoadProposal(p)}
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                  <Building2 className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{p.clientName}</p>
                                  <p className="text-xs text-gray-400">{p.clientEmail || 'No email'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="font-bold text-gray-900">${(p.value || 0).toLocaleString()}</p>
                            </td>
                            <td className="px-8 py-5">
                              <StatusBadge status={p.status} />
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-sm text-gray-500">{p.date}</p>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoadProposal(p);
                                  }}
                                  className="p-2 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (p.id) handleDeleteProposal(p.id);
                                  }}
                                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredHistory.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                              <div className="max-w-xs mx-auto">
                                <Search className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No proposals found matching your criteria.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Left: Form */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter">
                        Proposal <span className="text-emerald-500">Builder</span>
                      </h2>
                      <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Templates</label>
                        <div className="grid grid-cols-3 gap-2">
                          {PROPOSAL_TEMPLATES.map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => applyTemplate(t)}
                              className="p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-2 group"
                            >
                              <TemplateIcon name={t.icon} className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                              <span className="text-[10px] font-bold text-gray-500 group-hover:text-emerald-700 text-center leading-tight">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <InputGroup label="Client Name" value={clientName} onChange={setClientName} placeholder="e.g. Darwin Mining Corp" required />
                        <InputGroup label="Client Email" value={clientEmail} onChange={setClientEmail} placeholder="e.g. contact@darwinmining.com" type="email" />
                        
                        {/* Pricing Table Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Items</label>
                            <button 
                              type="button"
                              onClick={addPricingItem}
                              className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-600"
                            >
                              <Plus className="w-3 h-3" /> Add Item
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {pricingItems.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <input 
                                  placeholder="Item description"
                                  value={item.description}
                                  onChange={(e) => updatePricingItem(idx, 'description', e.target.value)}
                                  className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium border-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <input 
                                  type="number"
                                  placeholder="Qty"
                                  value={Number.isNaN(item.quantity) ? '' : item.quantity}
                                  onChange={(e) => updatePricingItem(idx, 'quantity', e.target.value === '' ? NaN : parseInt(e.target.value))}
                                  className="w-16 px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium border-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <input 
                                  type="number"
                                  placeholder="Price"
                                  value={Number.isNaN(item.price) ? '' : item.price}
                                  onChange={(e) => updatePricingItem(idx, 'price', e.target.value === '' ? NaN : parseFloat(e.target.value))}
                                  className="w-20 px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium border-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button 
                                  type="button"
                                  onClick={() => removePricingItem(idx)}
                                  className="p-2 text-gray-300 hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="Est. Value ($)" value={estimatedValue} onChange={setEstimatedValue} placeholder="50000" type="number" />
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                            <select 
                              value={proposal?.status || 'draft'} 
                              onChange={(e) => proposal?.id && handleUpdateStatus(proposal.id, e.target.value as ProposalStatus)}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="accepted">Accepted</option>
                              <option value="declined">Declined</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Details</label>
                          <textarea
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="Describe the service or project..."
                            required
                          />
                        </div>
                        <InputGroup label="Pricing Structure" value={price} onChange={setPrice} placeholder="e.g. $1.85/L + GST" required />
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full py-5 rounded-2xl bg-gray-900 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-emerald-400" />}
                        {isGenerating ? 'Drafting...' : 'Generate with AI'}
                      </button>
                    </form>
                  </div>

                  {/* Branding Mini-Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-gray-400" />
                      Branding
                    </h3>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border-none cursor-pointer p-0 bg-transparent"
                      />
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="flex-1 h-10 rounded-lg border border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="h-6 object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Upload Logo</span>
                        )}
                        <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="xl:col-span-8 space-y-6">
                  {!proposal ? (
                    <div className="h-full min-h-[700px] bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                        <FileText className="w-12 h-12 text-gray-200" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build?</h3>
                      <p className="text-gray-500 max-w-sm">
                        Fill in the details or select a template to generate your professional, AI-powered proposal.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                          <TabButton active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Edit3 className="w-4 h-4" />} label="Edit" />
                          <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} icon={<Eye className="w-4 h-4" />} label="Preview" />
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                          <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                          >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Export PDF
                          </button>
                        </div>
                      </div>

                      <div className="relative min-h-[800px]">
                        <AnimatePresence mode="wait">
                          {activeTab === 'edit' ? (
                            <motion.div
                              key="edit"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 h-full"
                            >
                              <textarea
                                value={proposal.content}
                                onChange={(e) => setProposal({ ...proposal, content: e.target.value })}
                                className="w-full h-[700px] p-8 bg-gray-50 rounded-3xl font-mono text-sm border-none focus:ring-0 resize-none leading-relaxed"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="preview"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              className="flex justify-center p-10 bg-gray-200 rounded-[40px] overflow-auto max-h-[900px]"
                            >
                              <div className="scale-[0.85] origin-top shadow-2xl">
                                <ProposalPreview ref={previewRef} data={proposal} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] opacity-50" />
      </div>
    </div>
    </ErrorBoundary>
  );
}

// Sub-components for cleaner App.tsx
const StatCard = ({ label, value, icon, trend, color }: { label: string, value: string | number, icon: React.ReactNode, trend: string, color: 'emerald' | 'blue' | 'amber' | 'slate' }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-50 text-slate-600'
  };
  
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mb-1">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{trend}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: ProposalStatus }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-600',
    accepted: 'bg-emerald-100 text-emerald-600',
    declined: 'bg-red-100 text-red-600'
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", styles[status])}>
      {status}
    </span>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
    <input
      type={type}
      value={value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value)) ? '' : value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
      required={required}
    />
  </div>
);

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
      active ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
    )}
  >
    {icon}
    {label}
  </button>
);

const TemplateIcon = ({ name, className }: { name: string, className?: string }) => {
  if (name === 'Truck') return <Truck className={className} />;
  if (name === 'Database') return <Database className={className} />;
  if (name === 'Droplet') return <Droplet className={className} />;
  return <FileText className={className} />;
};
