export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: Date | string;
  birthDate: Date | string | null;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  lastPaymentDate: Date | string | null;
  nextPaymentDate: Date | string | null;
  notes: string | null;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hireDate: Date | string;
  status: 'active' | 'inactive';
  schedule: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em meses
  benefits: string[];
  active: boolean;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: Date | string;
  method: 'credit' | 'debit' | 'cash' | 'pix' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  planId: string;
  notes: string | null;
}

export interface CheckIn {
  id: string;
  memberId: string;
  date: Date | string;
  time: string;
}
