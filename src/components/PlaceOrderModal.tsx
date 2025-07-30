import React, { useState, useEffect } from "react";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { X } from "lucide-react";

// Define a type for the supplier
interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
}

// Define the props for the modal component
interface PlaceOrderModalProps {
  request: Request | null;
  onClose: () => void;
  onOrderPlaced: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({
  request,
  onClose,
  onOrderPlaced,
}) => {
  const { updateRequestStatus } = useRequests();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch suppliers when the modal is opened for a request
  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suppliers`);
        if (!response.ok) {
          throw new Error("Failed to fetch suppliers");
        }
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        setError("Could not load suppliers. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (request) {
      fetchSuppliers();
    }
  }, [request]);

  // Handle the order placement
  const handlePlaceOrder = async () => {
    if (!request || !selectedSupplier || !user) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    if (!supplier) {
      setError("Selected supplier not found.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateRequestStatus(
        request.id,
        "order placed",
        "Order placed with the selected supplier.",
        "customer-officer",
        user.id,
        {
          supplierName: supplier.name,
          supplierPhone: supplier.phone,
          supplierEmail: supplier.email,
        }
      );
      onOrderPlaced(); // Callback to refresh data on the parent component
      onClose(); // Close the modal on success
    } catch (err) {
      setError("Failed to place the order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Place Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 border-t pt-4">
          <p className="text-sm text-gray-600"><strong>Request ID:</strong> {request.id}</p>
          <p className="text-sm text-gray-600"><strong>Vehicle No:</strong> {request.vehicleNo}</p>
        </div>
        <div className="mb-6">
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
            Select a Supplier
          </label>
          <select
            id="supplier"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading || suppliers.length === 0}
          >
            <option value="" disabled>
              {isLoading ? "Loading suppliers..." : "-- Select a supplier --"}
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} - {supplier.phone}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="flex justify-end space-x-4 border-t pt-4">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handlePlaceOrder}
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedSupplier || isLoading}
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
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
                      {supplier.phone && <p>Phone: {supplier.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
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
