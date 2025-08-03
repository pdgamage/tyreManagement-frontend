declare module 'react-datepicker' {
  const DatePicker: any;
  export default DatePicker;
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  brand?: string;
  model?: string;
}

export interface Request {
  id: number;
  created_at: string;
  status: string;
  orderNumber?: string;
  supplier_name?: string;
  supplier_phone?: string;
}
