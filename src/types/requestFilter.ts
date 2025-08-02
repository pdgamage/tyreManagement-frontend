export interface FilterParams {
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RequestFilterProps {
  onFilterChange?: (filters: FilterParams) => void;
}

export interface SuggestionItem {
  vehicleNumber: string;
}

export interface AutosuggestInputProps {
  placeholder: string;
  value: string;
  onChange: (event: React.FormEvent<HTMLElement>, params: { newValue: string }) => void;
  className?: string;
}

export interface SupplierDetails {
  name: string;
  email: string;
  phone: string;
  orderNumber: string;
  orderNotes?: string;
  orderTimestamp: string;
}

export interface RequestItem {
  id: number;
  status: string;
  submittedAt: string;
  requestReason: string;
  vehicleNumber: string;
  supplierDetails?: SupplierDetails;
}
