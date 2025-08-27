import { Receipt } from '../types/Receipt';
import { API_CONFIG } from '../config/api';

export class ReceiptService {
  static async generateReceipt(orderId: string): Promise<Receipt> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/receipts/generate/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  static async getReceipt(receiptId: string): Promise<Receipt> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/receipts/${receiptId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch receipt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }

  static async getReceiptByOrderId(orderId: string): Promise<Receipt> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/receipts/order/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch receipt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }
}
