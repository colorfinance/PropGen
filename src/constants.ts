import { ProposalTemplate } from './types';

export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'bulk-diesel',
    name: 'Bulk Diesel Delivery',
    description: 'Standard recurring delivery for construction or mining sites.',
    defaultPlan: 'Weekly bulk diesel delivery (approx. 5000L) to specified site locations. Includes real-time tracking via the Fuel Drop App.',
    defaultPrice: '$1.85 per litre + GST (Subject to TGP variations)',
    icon: 'Truck'
  },
  {
    id: 'tank-hire',
    name: 'Fuel Tank Hire',
    description: 'Short or long-term rental of self-bunded storage tanks.',
    defaultPlan: 'Hire of 1x 2000L Self-Bunded Fuel Tank. Includes delivery, setup, and monthly maintenance inspection.',
    defaultPrice: '$450.00 per month + GST',
    icon: 'Database'
  },
  {
    id: 'lubricants',
    name: 'Oils & Lubricants',
    description: 'Bulk supply of engine oils, AdBlue, and specialized lubricants.',
    defaultPlan: 'Supply of premium engine lubricants and AdBlue. Includes delivery and disposal of old containers.',
    defaultPrice: 'Priced per unit as per current catalog',
    icon: 'Droplet'
  }
];
