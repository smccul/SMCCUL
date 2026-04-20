export type AccountType = 'SHARE' | 'SAVINGS' | 'DPS' | 'FDR' | 'CHILD_SAVINGS' | 'LOAN';

export interface Member {
  id: string;
  name: string;
  phone: string;
  address?: string;
  memberId: string;
  joinDate: string;
  isChild: boolean;
  status: 'active' | 'inactive';
}

export interface Account {
  id: string;
  type: AccountType;
  balance: number;
  lastInterestCalculated: string;
  metadata?: {
    durationYrs?: number;
    monthlyProfit?: number;
    interestRate?: number;
  };
}

export interface Transaction {
  id: string;
  memberId: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'LOAN_REPAYMENT' | 'LOAN_DISBURSE';
  amount: number;
  date: string;
  description: string;
}
