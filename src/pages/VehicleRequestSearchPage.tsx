import React from 'react';
import UserInquiryDashboard from '../components/UserInquiryDashboard';
import { useAuth } from '../contexts/AuthContext';

const VehicleRequestSearchPage: React.FC = () => {
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-600">
          Please login to view your requests
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserInquiryDashboard userId={Number(user.id)} />
    </div>
  );
};

export default VehicleRequestSearchPage;
