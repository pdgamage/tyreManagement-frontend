// Receipt.tsx
import React from 'react';

interface ReceiptData {
  receiptNumber: string;
  orderNumber: string;
  requester: {
    name: string;
    email: string;
    phone: string;
  };
  vehicleDetails: string;
  tireDetails: {
    quantity: number;
    price: string;
  };
  supplier: {
    name: string;
    email: string;
    phone: string;
  };
}

const Receipt: React.FC = () => {
  // Placeholder data; in a real implementation, fetch details from the requests table
  const receiptData: ReceiptData = {
    receiptNumber: 'R-20250828-001',
    orderNumber: 'O-20250828-001',
    requester: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-0100'
    },
    vehicleDetails: 'Truck - ABC-1234',
    tireDetails: {
      quantity: 4,
      price: '$100 each'
    },
    supplier: {
      name: 'Supplier Co',
      email: 'supplier@example.com',
      phone: '555-0200'
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 border border-gray-300 shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Receipt</h1>
      <div className="mb-4">
        <p><span className="font-semibold">Receipt Number:</span> {receiptData.receiptNumber}</p>
        <p><span className="font-semibold">Order Number:</span> {receiptData.orderNumber}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-bold text-lg">Requester Details</h2>
        <p><span className="font-semibold">Name:</span> {receiptData.requester.name}</p>
        <p><span className="font-semibold">Email:</span> {receiptData.requester.email}</p>
        <p><span className="font-semibold">Phone:</span> {receiptData.requester.phone}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-bold text-lg">Vehicle Details</h2>
        <p>{receiptData.vehicleDetails}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-bold text-lg">Tire Tube Details</h2>
        <p><span className="font-semibold">Quantity:</span> {receiptData.tireDetails.quantity}</p>
        <p><span className="font-semibold">Price:</span> {receiptData.tireDetails.price}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-bold text-lg">Supplier Details</h2>
        <p><span className="font-semibold">Name:</span> {receiptData.supplier.name}</p>
        <p><span className="font-semibold">Email:</span> {receiptData.supplier.email}</p>
        <p><span className="font-semibold">Phone:</span> {receiptData.supplier.phone}</p>
      </div>
      <div className="text-center">
        <button onClick={handleDownload} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Download Receipt
        </button>
      </div>
    </div>
  );
};

export default Receipt;
