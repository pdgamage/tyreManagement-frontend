import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TireRequestDetailsCard from "../components/TireRequestDetailsCard";
import { Request } from "../types/request";
import { apiUrls } from "../config/api";

interface LocationState {
  fromInquiry?: boolean;
  returnPath?: string;
}

export default function SharedRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error("Invalid request ID.");
        }
        const res = await fetch(apiUrls.requestById(numericId));
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Request not found.");
          }
          throw new Error("Failed to fetch request.");
        }
        const data = await res.json();
        setRequest(data);
      } catch (err: any) {
        setError(err.message || "Failed to load request");
      }
      setLoading(false);
    };
    fetchRequest();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600">Loading request details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md text-red-600">
        <p className="font-semibold">Error: {error}</p>
      </div>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-md text-red-600">
        <p className="font-semibold">Request not found.</p>
      </div>
    </div>
  );

  return <TireRequestDetailsCard request={request} fromInquiry={state?.fromInquiry} />;
}
