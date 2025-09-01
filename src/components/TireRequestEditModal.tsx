import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Request } from "../types/request";
import api from "../config/api";

interface TireRequestEditModalProps {
  request: Request;
  onClose: () => void;
  onSuccess: () => void;
}

const TireRequestEditModal: React.FC<TireRequestEditModalProps> = ({
  request,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    vehicleNumber: request.vehicleNumber,
    tireSize: request.tireSize,
    quantity: request.quantity,
    tubesQuantity: request.tubesQuantity,
    requestReason: request.requestReason,
    // Add other editable fields as needed
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.put(`/requests/${request.id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <div className="relative w-full max-w-lg p-6 mx-auto bg-white rounded-lg shadow-lg">
        <Dialog.Title className="mb-4 text-lg font-bold">
          Edit Tire Request
        </Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Vehicle Number</label>
            <input
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tire Size</label>
            <input
              name="tireSize"
              value={formData.tireSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tubes Quantity</label>
            <input
              name="tubesQuantity"
              type="number"
              value={formData.tubesQuantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Request Reason</label>
            <textarea
              name="requestReason"
              value={formData.requestReason}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {/* Add more fields as needed */}
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default TireRequestEditModal;
