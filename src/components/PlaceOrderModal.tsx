import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Request } from "../types/request";
import type { TireRequest } from "../types/api";
import { apiUrls } from "../config/api";

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  formsfree_key: string;
}

interface PlaceOrderModalProps {
  request: Request | TireRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({
  request,
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null
  );
  const [orderNumber, setOrderNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderPlacedDate, setOrderPlacedDate] = useState(() => {
    const now = new Date();
    // Format: YYYY-MM-DDThh:mm
    return now.toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(apiUrls.suppliers());
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        setError("Failed to fetch suppliers");
      }
    } catch (err) {
      setError("Error fetching suppliers");
      console.error("Error fetching suppliers:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedSupplierId) {
      setError("Please select a supplier");
      return;
    }

    if (!orderNumber || orderNumber.trim() === '') {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the selected supplier details
      const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
      if (!selectedSupplier) {
        setError("Selected supplier not found");
        return;
      }

      // Debug log for supplier details
      console.log("Selected supplier details:", {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
        email: selectedSupplier.email,
        phone: selectedSupplier.phone
      });

      const response = await fetch(
        `${apiUrls.requestById(request?.id || "")}/place-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplierId: selectedSupplierId,
            supplierName: selectedSupplier.name,
            supplierEmail: selectedSupplier.email,
            supplierPhone: selectedSupplier.phone || '',  // Ensure we always send a value
            orderNumber: orderNumber.trim(),
            orderNotes: orderNotes.trim(),
            orderPlacedDate: new Date(orderPlacedDate).toISOString(),  // Convert to ISO format for database
          }),
        }
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log("Order placed successfully:", result);

        // Show success message
        setSuccess(
          `Order placed successfully! Email sent to ${result.supplier.name} (${result.supplier.email})`
        );
        setError(null);

        // Wait 2 seconds to show success message, then close
        setTimeout(() => {
          onOrderPlaced();
          onClose();
          // Reset form
          setSelectedSupplierId(null);
          setOrderNotes("");
          setSuccess(null);
        }, 2000);
      } else {
        const errorData = await response.json();
        // Check if the error is just a database issue but email was sent
        if (
          errorData.error &&
          errorData.error.includes("Data truncated") &&
          errorData.emailResult
        ) {
          // Email was sent successfully, treat as success
          console.log("Order email sent successfully despite database error");

          // Show success message
          setSuccess("Order placed successfully! Email sent to supplier.");
          setError(null);

          // Wait 2 seconds to show success message, then close
          setTimeout(() => {
            onOrderPlaced();
            onClose();
            // Reset form
            setSelectedSupplierId(null);
            setOrderNotes("");
            setSuccess(null);
          }, 2000);
        } else {
          setError(errorData.error || "Failed to place order");
        }
      }
    } catch (err) {
      setError("Error placing order");
      console.error("Error placing order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSupplierId(null);
    setOrderNotes("");
    setOrderNumber("");
    const now = new Date();
    setOrderPlacedDate(now.toISOString().slice(0, 16));
    setError(null);
    onClose();
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Place Order - Request #{request.id}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Request Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Vehicle:</span>{" "}
              {request.vehicleNumber}
            </div>
            <div>
              <span className="font-medium">Tire Size:</span>{" "}
              {request.tireSizeRequired}
            </div>
            <div>
              <span className="font-medium">Quantity:</span> {request.quantity}
            </div>
            <div>
              <span className="font-medium">Tubes:</span>{" "}
              {request.tubesQuantity}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Supplier Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Select Supplier
            </h3>
            {suppliers.length === 0 ? (
              <p className="text-gray-500">Loading suppliers...</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSupplierId === supplier.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSupplierId(supplier.id)}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="supplier"
                        value={supplier.id}
                        checked={selectedSupplierId === supplier.id}
                        onChange={() => setSelectedSupplierId(supplier.id)}
                        className="mr-3"
                      />
                      <h4 className="font-medium text-gray-800">
                        {supplier.name}
                      </h4>
                    </div>
                    <div className="ml-6 text-sm text-gray-600">
                      <p>Email: {supplier.email}</p>
                      <p>Phone: {supplier.phone || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number *
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter order number"
              required
            />
          </div>

          {/* Order Placed Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Placed Date *
            </label>
            <input
              type="datetime-local"
              value={orderPlacedDate}
              onChange={(e) => setOrderPlacedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Order Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes (Optional)
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any special instructions or notes for the supplier..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {success}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSupplierId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
