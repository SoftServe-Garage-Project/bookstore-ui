import { authService } from '../authService/authService';

export interface PromoCode {
  id: number;
  code: string;
  discountPercentage: number;
  description: string;
  validFrom: string;
  validTo?: string;
  maxUses?: number;
  currentUses: number;
  minOrderAmount: number;
  isActive: boolean;
}

const API_URL = '/api/promo-codes';

export const promoCodeService = {
  getAll: async (): Promise<PromoCode[]> => {
    const res = await authService.authorizedFetch(API_URL);
    if (!res.ok) throw new Error("Failed to load promo codes");
    const data = await res.json();
    return data.content || data;
  },

  create: async (data: Partial<PromoCode>) => {
    const res = await authService.authorizedFetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Creation failed");
    return res.json();
  },

  update: async (id: number, data: Partial<PromoCode>) => {
    const res = await authService.authorizedFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  },

  delete: async (id: number) => {
    const res = await authService.authorizedFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Delete failed");
  },

  toggleActive: async (id: number, active: boolean) => {
    const action = active ? 'activate' : 'deactivate';
    const res = await authService.authorizedFetch(`${API_URL}/${id}/${action}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error(`Failed to ${action}`);
  }
};