import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequests } from "../contexts/RequestContext";
import { apiUrls } from "../config/api";

const UserRequestUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchRequests } = useRequests();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Editable and read-only fields
  const [formData, setFormData] = useState<any>({
    // Editable fields
    quantity: "",
    tubesQuantity: "",
    currentKm: "",
    previousKm: "",
    wearPattern: "",
    requestReason: "",
    deliveryOffice: "",
    deliveryStreet: "",
    deliveryTown: "",
    comments: "",

    // Read-only fields
    id: "",
    status: "",
    submittedAt: "",
    tireSize: "",
    vehicleId: "",
    vehicleNumber: "",
    vehicleBrand: "",
    vehicleModel: "",
    department: "",
    costCentre: "",
    currentMake: "",
    lastReplacement: "",
    kmDifference: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    totalPrice: "",
    warrantyDistance: "",
    tireWearIndicator: "",
  });

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(apiUrls.requestById(id!));
        const data = await response.json();
        setRequest(data);
        setFormData({
          // Editable fields
          quantity: data.quantity ?? "",
          tubesQuantity: data.tubesQuantity ?? "",
          currentKm: data.currentKm ?? "",
          previousKm: data.previousKm ?? "",
          wearPattern: data.wearPattern ?? "",
          requestReason: data.requestReason ?? "",
          deliveryOffice: data.deliveryOffice ?? "",
          deliveryStreet: data.deliveryStreet ?? "",
          deliveryTown: data.deliveryTown ?? "",
          comments: data.comments ?? "",

          // Read-only fields
          id: data.id ?? "",
          status: data.status ?? "",
          submittedAt:
            data.submittedAt && new Date(data.submittedAt).toLocaleString(),
          tireSize: data.tireSize ?? "",
          vehicleId: data.vehicleId ?? "",
          vehicleNumber: data.vehicleNumber ?? "",
          vehicleBrand: data.vehicleBrand ?? "",
          vehicleModel: data.vehicleModel ?? "",
          department: data.department ?? "",
          costCentre: data.costCentre ?? "",
          currentMake: data.currentMake ?? "",
          lastReplacement:
            data.lastReplacement &&
            new Date(data.lastReplacement).toLocaleString(),
          kmDifference: data.kmDifference ?? "",
          requesterName: data.requesterName ?? "",
          requesterEmail: data.requesterEmail ?? "",
          requesterPhone: data.requesterPhone ?? "",
          totalPrice: data.totalPrice ?? "",
          warrantyDistance: data.warrantyDistance ?? "",
          tireWearIndicator: data.tireWearIndicator ?? "",
        });
      } catch (error) {
        console.error("Error fetching request:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Only send editable fields
      const updateData = {
        quantity: formData.quantity,
        tubesQuantity: formData.tubesQuantity,
        currentKm: formData.currentKm,
        previousKm: formData.previousKm,
        wearPattern: formData.wearPattern,
        requestReason: formData.requestReason,
        deliveryOffice: formData.deliveryOffice,
        deliveryStreet: formData.deliveryStreet,
        deliveryTown: formData.deliveryTown,
        comments: formData.comments,
      };

      const response = await fetch(apiUrls.requestById(id!), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await fetchRequests();
        navigate("/user");
      }
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto">
        <h1 className="mb-6 text-2xl font-bold">
          Update Request {formData.id}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 bg-white rounded-lg shadow"
        >
          {/* Request Information */}
          <div className="p-4 rounded-lg bg-blue-50">
            <h2 className="mb-4 text-lg font-semibold">Request Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium text-gray-600">
                  Status
                </label>
                <input
                  type="text"
                  value={formData.status}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-600">
                  Submitted
                </label>
                <input
                  type="text"
                  value={formData.submittedAt}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">
                  Request Reason *
                </label>
                <textarea
                  name="requestReason"
                  value={formData.requestReason}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={2}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Comments</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-4 text-lg font-semibold">Vehicle Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">Vehicle ID</label>
                <input
                  type="text"
                  value={formData.vehicleId}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Brand</label>
                <input
                  type="text"
                  value={formData.vehicleBrand}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Model</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Department/Section
                </label>
                <input
                  type="text"
                  value={formData.department}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Cost Center</label>
                <input
                  type="text"
                  value={formData.costCentre}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Tire Details */}
          <div className="p-4 rounded-lg bg-blue-50">
            <h2 className="mb-4 text-lg font-semibold">Tire Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">Tire Size</label>
                <input
                  type="text"
                  value={formData.tireSize}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Tubes Quantity</label>
                <input
                  type="number"
                  name="tubesQuantity"
                  value={formData.tubesQuantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Current Make</label>
                <input
                  type="text"
                  value={formData.currentMake}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Last Replacement
                </label>
                <input
                  type="text"
                  value={formData.lastReplacement}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Current KM</label>
                <input
                  type="number"
                  name="currentKm"
                  value={formData.currentKm}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Previous KM</label>
                <input
                  type="number"
                  name="previousKm"
                  value={formData.previousKm}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">KM Difference</label>
                <input
                  type="text"
                  value={formData.kmDifference}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Wear Pattern</label>
                <input
                  type="text"
                  name="wearPattern"
                  value={formData.wearPattern}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Requester Information */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-4 text-lg font-semibold">
              Requester Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={formData.requesterName}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Email</label>
                <input
                  type="text"
                  value={formData.requesterEmail}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Phone</label>
                <input
                  type="text"
                  value={formData.requesterPhone}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Delivery & Pricing Information */}
          <div className="p-4 rounded-lg bg-blue-50">
            <h2 className="mb-4 text-lg font-semibold">
              Delivery & Pricing Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium">
                  Delivery Office *
                </label>
                <input
                  type="text"
                  name="deliveryOffice"
                  value={formData.deliveryOffice}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Delivery Street
                </label>
                <input
                  type="text"
                  name="deliveryStreet"
                  value={formData.deliveryStreet}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Delivery Town</label>
                <input
                  type="text"
                  name="deliveryTown"
                  value={formData.deliveryTown}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Total Price</label>
                <input
                  type="text"
                  value={formData.totalPrice}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Warranty Distance
                </label>
                <input
                  type="text"
                  value={formData.warrantyDistance}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Tire Wear Indicator
                </label>
                <input
                  type="text"
                  value={formData.tireWearIndicator}
                  className="w-full p-2 bg-gray-100 border rounded"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/user")}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRequestUpdate;
