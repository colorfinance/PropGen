import React, { forwardRef } from 'react';
import Markdown from 'react-markdown';
import { ProposalData, FUEL_DROP_BRANDING } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  ShieldCheck,
  Award,
  Calendar,
  User,
  Mail,
  MapPin,
  Phone,
  Droplets
} from 'lucide-react';

interface Props {
  data: ProposalData;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'accepted': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'sent': return <Clock className="w-5 h-5 text-blue-500" />;
    case 'declined': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
};

export const ProposalPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const primaryColor = data.branding?.primaryColor || FUEL_DROP_BRANDING.primary;
  const logoUrl = data.branding?.logoUrl;

  return (
    <div 
      ref={ref}
      className="w-[794px] min-h-[1123px] bg-white p-[60px] shadow-2xl relative overflow-hidden flex flex-col font-sans"
      id="proposal-pdf-content"
    >
      {/* Background Watermark for Status */}
      {data.status !== 'draft' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] pointer-events-none opacity-[0.03] select-none z-0">
          <span className="text-[180px] font-black uppercase tracking-tighter">
            {data.status}
          </span>
        </div>
      )}

      {/* Header Accent */}
      <div 
        className="absolute top-0 left-0 w-full h-2" 
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Header */}
      <div className="flex justify-between items-start mb-16 relative z-10">
        <div className="space-y-6">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-16 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-xl text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Droplets className="w-8 h-8" />
              </div>
              <span className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                Fuel <span style={{ color: primaryColor }}>Drop</span>
              </span>
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">
              Business <span style={{ color: primaryColor }}>Proposal</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Calendar className="w-3 h-3" />
              Issued on {data.date}
            </div>
          </div>
        </div>

        <div className="text-right space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
            {getStatusIcon(data.status || 'draft')}
            <span className="text-xs font-black uppercase tracking-widest text-gray-600">
              Status: {data.status || 'Draft'}
            </span>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Ref: FD-{data.id?.slice(-6).toUpperCase() || 'DRAFT'}
          </div>
        </div>
      </div>

      {/* Client & Value Summary */}
      <div className="grid grid-cols-2 gap-12 mb-16 relative z-10">
        <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-3 h-3" />
            Prepared For
          </h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-900">{data.clientName}</p>
            {data.clientEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-3.5 h-3.5" />
                {data.clientEmail}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-gray-900 text-white rounded-[32px] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award className="w-3 h-3" />
              Investment Summary
            </h3>
            <div className="space-y-1">
              <p className="text-3xl font-black italic uppercase tracking-tighter">
                ${(data.value || 0).toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Estimated Contract Value
              </p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <div className="prose prose-slate max-w-none prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900">
          <div className="markdown-body">
            <Markdown>{data.content}</Markdown>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-16 pt-16 border-t border-gray-100 relative z-10">
        <div className="grid grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="h-20 border-b-2 border-gray-100 flex items-end pb-2">
              <span className="text-3xl font-serif italic text-gray-300 select-none">Fuel Drop Authorized</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Fuel Drop Representative</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Authorized Signatory</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-20 border-b-2 border-gray-100 flex items-end pb-2">
              <span className="text-sm text-gray-300 font-bold uppercase tracking-widest">Client Signature</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{data.clientName}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Authorized Client Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-50 flex justify-between items-end relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-500" />
              Virginia, NT 0834
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-500" />
              0488 845 388
            </div>
          </div>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            © 2026 Fuel Drop. All Rights Reserved.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black italic uppercase tracking-tighter text-gray-300">
            Powered by Fuel <span className="text-emerald-500/50">Drop</span> Engine
          </p>
        </div>
      </div>
    </div>
  );
});

ProposalPreview.displayName = 'ProposalPreview';
