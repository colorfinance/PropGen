export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface ProposalBranding {
  primaryColor: string;
  logoUrl?: string;
}

export interface UserProfile {
  uid: string;
  companyName: string;
  website?: string;
  branding: ProposalBranding;
  aiConfig: {
    toneOfVoice: string;
    companyBackground: string;
  };
  updatedAt: any;
}

export interface PricingItem {
  description: string;
  quantity: number;
  price: number;
}

export interface ProposalData {
  id?: string;
  uid: string;
  clientName: string;
  clientEmail?: string;
  value?: number;
  status: ProposalStatus;
  date: string;
  content: string;
  branding: ProposalBranding;
  pricingItems?: PricingItem[];
  createdAt?: any;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  defaultPlan: string;
  defaultPrice: string;
  icon: string;
}

export const FUEL_DROP_BRANDING = {
  primary: '#10b981', // Emerald 500
  secondary: '#0f172a', // Slate 900
  accent: '#f8fafc', // Slate 50
  text: '#334155', // Slate 700
};
