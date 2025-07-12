import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "../types/request";
import { ArrowLeft, Calendar, User, Car, FileText, Image as ImageIcon, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

const CustomerOfficerRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { user } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isNaN(numericId)) {
          throw new Error("Invalid request ID.");
        }
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL ||
            "https://tyremanagement-backend-production.up.railway.app"
          }/api/requests/${numericId}`
        );
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Request not found.");
          }
          throw new Error("Failed to fetch request.");
        }
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [numericId]);

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (request?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % request.images.length);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  };

  const prevImage = () => {
    if (request?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + request.images.length) % request.images.length);
      setImageZoom(1);
      setImagePan({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => setImageZoom(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setImageZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePan.x, y: e.clientY - imagePan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageZoom > 1) {
      setImagePan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/customer-officer")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Request Not Found</h2>
          <button
            onClick={() => navigate("/customer-officer")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/customer-officer")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Request Details - #{request.id}
          </h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              request.status === "complete" 
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <span className="text-gray-500 flex items-center">
              <Calendar size={16} className="mr-1" />
              {new Date(request.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Request Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Request Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <div className="flex items-center">
                <Car size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-900">{request.vehicleNumber}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested By
              </label>
              <div className="flex items-center">
                <User size={16} className="mr-2 text-gray-400" />
                <span className="text-gray-900">{request.userName}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tire Size
              </label>
              <span className="text-gray-900">{request.tireSize}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <span className="text-gray-900">{request.quantity}</span>
            </div>
          </div>
          
          {request.description && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {request.description}
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon size={20} className="mr-2" />
              Images ({request.images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {request.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openImageModal(index)}
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production.up.railway.app"}${image.imagePath}`}
                    alt={`Request image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Process Notes</h2>
          
          {request.supervisor_notes && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Supervisor Notes</h3>
              <p className="text-blue-800">{request.supervisor_notes}</p>
            </div>
          )}
          
          {request.technical_manager_note && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Technical Manager Notes</h3>
              <p className="text-purple-800">{request.technical_manager_note}</p>
            </div>
          )}
          
          {request.engineer_note && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Engineer Notes</h3>
              <p className="text-green-800">{request.engineer_note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request?.images && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            
            <div className="relative">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL || "https://tyremanagement-backend-production.up.railway.app"}${request.images[currentImageIndex].imagePath}`}
                alt={`Request image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain cursor-move"
                style={{
                  transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                draggable={false}
              />
              
              {request.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                onClick={zoomOut}
                className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={zoomIn}
                className="text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ZoomIn size={20} />
              </button>
            </div>
            
            {request.images.length > 1 && (
              <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 rounded-full px-3 py-1">
                {currentImageIndex + 1} / {request.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOfficerRequestDetails;
