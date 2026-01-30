import { authService } from '../authService/authService';

export interface Transaction {
  id: number;
  senderAccountId: number | null;
  receiverAccountId: number | null;
  amount: number;
  type: 'PURCHASE' | 'DEPOSIT' | string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
  paymentMethod: string;
  description: string;
  orderId?: number;
  createdAt: string;
}

export interface TransactionPageResponse {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
}

const API_BASE_URL = '/api';

export const transactionService = {
  getTransactions: async (page: number = 0, size: number = 10): Promise<TransactionPageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'createdAt,desc'
    });

    const response = await authService.authorizedFetch(`${API_BASE_URL}/transactions?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getBalance: async (): Promise<BalanceResponse> => {
    const response = await authService.authorizedFetch(`${API_BASE_URL}/balance`);
    if (!response.ok) throw new Error('Failed to fetch balance');
    return response.json();
  },

  topUp: async (amount: number): Promise<any> => {
    const response = await authService.authorizedFetch(`${API_BASE_URL}/topUp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error('Top up failed');
    return response.json();
  }
};