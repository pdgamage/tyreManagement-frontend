import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User } from 'lucide-react';
import type { Request } from '../types/request';
import type { Supplier } from '../types/supplier';

interface PlaceOrderModalProps {
  request: Request | null;
  onClose: () => void;
  isOpen: boolean;
  onOrderPlaced: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({ 
  request, 
  onClose, 
  isOpen, 
  onOrderPlaced 
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/suppliers`
      );
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedSupplier || !request) {
      alert('Please select a supplier');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/${request.id}/place-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supplierId: selectedSupplier.id,
            orderNotes: orderNotes.trim()
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`Order placed successfully with ${result.supplier}! Email sent to ${result.email}`);
        onOrderPlaced();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to place order: ${error.error}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSupplier(null);
    setOrderNotes('');
    onClose();
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Place Order - Request #{request.id}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Vehicle: {request.vehicleNumber} | Tire Size: {request.tireSizeRequired} | Quantity: {request.quantity}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {suppliersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Supplier Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Supplier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedSupplier?.id === supplier.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {supplier.name}
                            </h5>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-1" />
                              <span className="truncate">{supplier.email}</span>
                            </div>
                            {supplier.phone && (
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Phone className="w-4 h-4 mr-1" />
                                <span>{supplier.phone}</span>
                              </div>
                            )}
                          </div>
                          {selectedSupplier?.id === supplier.id && (
                            <div className="flex-shrink-0">
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {suppliers.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No suppliers available</p>
                  )}
                </div>

                {/* Order Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions or notes for the supplier..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Selected Supplier Summary */}
                {selectedSupplier && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Order Summary</h5>
                    <p className="text-sm text-gray-600">
                      Order will be sent to: <strong>{selectedSupplier.name}</strong> ({selectedSupplier.email})
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      The supplier will receive a detailed email with all request information and specifications.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedSupplier || loading || suppliersLoading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
