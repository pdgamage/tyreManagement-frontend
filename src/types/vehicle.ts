export interface Vehicle {
  id: number;
  vehicleNumber: string;
  brand: string;
  model: string;
}

export interface SupplierDetails {
  name: string;
  email: string;
  phone: string;
  orderNumber: string;
  orderNotes: string;
  orderTimestamp: string;
}

export interface VehicleRequest {
  id: number;
  vehicleNumber: string;
  status: string;
  submittedAt: string;
  requestReason: string;
  supplierDetails?: SupplierDetails;
  images: string[];
}

export interface SuggestionsFetchRequest {
  value: string;
}

export interface AutosuggestProps {
  newValue: string;
}
