import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrls } from '../config/api';

// Error type
type ApiError = {
  message: string;
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
};

// API response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface UseReceiptsOptions {
  customerId?: string | number;
}

export interface Receipt {
  id: number;
  order_id: string | null;
  receipt_number: string;
  total_amount: number;
  vehicle_number: string;
  request_id: number;
  date_generated: string;
  customer_officer_id: number;
  customer_officer_name: string;
  vehicle_brand: string;
  vehicle_model: string;
  items: {
    tireSize: string;
    quantity: number;
    tubesQuantity: number;
    unitPrice?: number;
  }[];
  notes?: string;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone?: string;
  submitted_date: string;
  order_placed_date: string;
  order_number?: string;
  request?: {
    status: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}

export const useReceipts = ({ customerId }: UseReceiptsOptions = {}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch all receipts or receipts by customer officer
  const receiptsQuery = useQuery({
    queryKey: ['receipts', customerId],
    queryFn: async () => {
      try {
        const url = customerId 
          ? apiUrls.receiptsByCustomerOfficer(customerId)
          : apiUrls.receipts();
        const response = await axios.get<ApiResponse<Receipt[]>>(url);
        return response.data.data;
      } catch (error) {
        setError(
          (error as ApiError).response?.data?.error || 
          (error as ApiError).message || 
          'Failed to fetch receipts'
        );
        throw error;
      }
    }
  });

  // Fetch a single receipt
  const getReceiptById = async (id: number | string) => {
    try {
      const response = await axios.get<ApiResponse<Receipt>>(apiUrls.receiptById(id));
      return response.data.data;
    } catch (error) {
      setError(
        (error as ApiError).response?.data?.error || 
        (error as ApiError).message || 
        'Failed to fetch receipt'
      );
      throw error;
    }
  };

  // Create a new receipt
  const createReceiptMutation = useMutation({
    mutationFn: async (receiptData: Omit<Receipt, 'id' | 'receipt_number'>) => {
      try {
        const response = await axios.post<ApiResponse<Receipt>>(
          apiUrls.receipts(),
          receiptData
        );
        return response.data.data;
      } catch (error) {
        setError(
          (error as ApiError).response?.data?.error || 
          (error as ApiError).message || 
          'Failed to create receipt'
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    }
  });

  // Update a receipt
  const updateReceiptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<Receipt> }) => {
      try {
        const response = await axios.put<ApiResponse<Receipt>>(
          apiUrls.receiptById(id),
          data
        );
        return response.data.data;
      } catch (error) {
        setError(
          (error as ApiError).response?.data?.error || 
          (error as ApiError).message || 
          'Failed to update receipt'
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    }
  });

  // Delete a receipt
  const deleteReceiptMutation = useMutation({
    mutationFn: async (id: number | string) => {
      try {
        await axios.delete<ApiResponse<void>>(apiUrls.receiptById(id));
      } catch (error) {
        setError(
          (error as ApiError).response?.data?.error || 
          (error as ApiError).message || 
          'Failed to delete receipt'
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    }
  });

  // Clear error
  const clearError = () => setError(null);

  return {
    receipts: receiptsQuery.data,
    isLoading: receiptsQuery.isLoading,
    error,
    clearError,
    refetch: receiptsQuery.refetch,
    getReceiptById,
    createReceipt: createReceiptMutation.mutateAsync,
    updateReceipt: updateReceiptMutation.mutateAsync,
    deleteReceipt: deleteReceiptMutation.mutateAsync,
    isCreating: createReceiptMutation.status === 'pending',
    isUpdating: updateReceiptMutation.status === 'pending',
    isDeleting: deleteReceiptMutation.status === 'pending'
  };
};

export default useReceipts;
