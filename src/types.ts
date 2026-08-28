export type BillStatus = 'planned' | 'paid';

export interface Bill {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  category: string;
  attachment: string;
  notes: string;
  status: BillStatus;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseState {
  unlocked: boolean;
  message: string;
}
