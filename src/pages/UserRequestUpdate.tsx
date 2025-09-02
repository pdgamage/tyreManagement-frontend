import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequests } from "../contexts/RequestContext";
import { useAuth } from "../contexts/AuthContext";
import { apiUrls } from "../config/api";

const UserRequestUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchRequests } = useRequests();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<any>({
    quantity: "",
    requestReason: "",
    tireSize: "",
    brand: "",
    pattern: "",
    vehicleId: "",
    department: "",
    costCentre: "",
    status: "",
    submittedAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(apiUrls.requestById(id!));
        const data = await response.json();
        setRequest(data);
        setFormData({
          ...data,
          submittedAt: new Date(data.submittedAt).toLocaleString(),
          updatedAt: new Date(data.updatedAt).toLocaleString(),
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      // Only send updatable fields
      const updateData = {
        quantity: formData.quantity,
        requestReason: formData.requestReason,
        tireSize: formData.tireSize,
        brand: formData.brand,
        pattern: formData.pattern,
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
      <div className="max-w-3xl px-4 mx-auto">
        <h1 className="mb-6 text-2xl font-bold">Update Request #{id}</h1>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 bg-white rounded-lg shadow"
        >
          {/* Updatable Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              <label className="block mb-2 font-medium">Tire Size *</label>
              <input
                type="text"
                name="tireSize"
                value={formData.tireSize}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Pattern</label>
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Request Reason *</label>
            <textarea
              name="requestReason"
              value={formData.requestReason}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>

          {/* Non-updatable Fields (Read-only) */}
          <div className="grid grid-cols-1 gap-6 p-4 rounded-lg bg-gray-50 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Vehicle ID
              </label>
              <input
                type="text"
                value={formData.vehicleId}
                className="w-full p-2 bg-gray-100 border rounded"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                className="w-full p-2 bg-gray-100 border rounded"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Cost Centre
              </label>
              <input
                type="text"
                value={formData.costCentre}
                className="w-full p-2 bg-gray-100 border rounded"
                readOnly
              />
            </div>

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
                Submitted At
              </label>
              <input
                type="text"
                value={formData.submittedAt}
                className="w-full p-2 bg-gray-100 border rounded"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Last Updated
              </label>
              <input
                type="text"
                value={formData.updatedAt}
                className="w-full p-2 bg-gray-100 border rounded"
                readOnly
              />
            </div>
          </div>

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
