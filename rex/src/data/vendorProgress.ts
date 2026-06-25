export type VendorDeliverableStatus = 'complete' | 'in-progress' | 'upcoming';

export interface VendorDeliverable {
  id: string;
  label: string;
  vendor: string;
  progress: number;
  status: VendorDeliverableStatus;
  eta: string;
}

export interface VendorActivity {
  id: string;
  time: string;
  message: string;
}

export const VENDOR_DELIVERABLES: VendorDeliverable[] = [
  {
    id: 'website',
    label: 'Website',
    vendor: 'Pixel Forge Studio',
    progress: 82,
    status: 'in-progress',
    eta: 'Ships in 4 days',
  },
  {
    id: 'app',
    label: 'Mobile app (iOS + Android)',
    vendor: 'Pixel Forge Studio',
    progress: 54,
    status: 'in-progress',
    eta: 'Beta in 2 weeks',
  },
  {
    id: 'admin',
    label: 'Admin dashboard',
    vendor: 'Stackline Dev',
    progress: 100,
    status: 'complete',
    eta: 'Live',
  },
  {
    id: 'api',
    label: 'API & token integration',
    vendor: 'Chaincraft Labs',
    progress: 28,
    status: 'upcoming',
    eta: 'Starts next milestone',
  },
];

export const VENDOR_ACTIVITY: VendorActivity[] = [
  { id: 'a1', time: '12m ago', message: 'App home screen pushed to TestFlight' },
  { id: 'a2', time: '3h ago', message: 'Website hero section approved by founder' },
  { id: 'a3', time: '1d ago', message: 'Admin dashboard milestone payout released' },
];
