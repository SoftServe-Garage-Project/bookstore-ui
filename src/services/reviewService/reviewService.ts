import { authService } from '../authService/authService';

export interface Review {
  id: number;
  bookId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  bookId: number;
  rating: number;
  comment: string;
}

export interface PaginatedReviewResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const API_URL = '/api/reviews';

export const reviewService = {
  fetchReviewsByBookId: async (bookId: number): Promise<Review[]> => {
    const response = await authService.publicFetch(`${API_URL}/${bookId}`, {
      method: 'GET',
    });

    if (!response.ok) return [];

    const data: PaginatedReviewResponse = await response.json();
    
    return data.content || []; 
  },

  addReview: async (reviewData: ReviewRequest): Promise<Review> => {
    const response = await authService.publicFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add review');
    }

    return response.json();
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    const response = await authService.publicFetch(`${API_URL}/${reviewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
  }
};