import React from 'react';

interface DashboardHeaderProps {
  userName: string;
  currentTime: string;
  currentDate: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  onNewRequest: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  currentTime,
  currentDate,
  pendingCount,
  approvedCount,
  rejectedCount,
  onNewRequest
}) => {
  return (
    <div className="bg-[#1e2a3b]">
      <div className="p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-4 rounded-lg">
              <i className="fas fa-file-alt text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">User Dashboard</h1>
              <p className="text-gray-300">Submit tire requests and track your applications</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-300">User Level Access</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-300">Welcome back, {userName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-sm text-gray-300">Current Time</div>
              <div className="font-semibold text-white">{currentTime}</div>
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-sm text-gray-300">Today's Date</div>
              <div className="font-semibold text-white">{currentDate}</div>
            </div>
            <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded">
              <span className="text-white">{userName}</span>
              <span className="text-sm bg-emerald-500 px-2 py-0.5 rounded text-white">User</span>
            </div>
            <button className="bg-emerald-500 p-2 rounded">
              <i className="fas fa-user text-xl text-white" />
            </button>
          </div>
        </div>

        <button 
          onClick={onNewRequest}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg flex items-center gap-2 text-white"
        >
          <i className="fas fa-plus" />
          New Tire Request
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 px-8 pb-8">
        <div className="bg-amber-500 text-white p-6 rounded-lg">
          <h3 className="text-4xl font-bold mb-2">{pendingCount}</h3>
          <p className="mb-4">Pending Requests</p>
          <p className="text-sm">Awaiting review</p>
          <div className="flex justify-end">
            <i className="fas fa-clock text-4xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-emerald-500 text-white p-6 rounded-lg">
          <h3 className="text-4xl font-bold mb-2">{approvedCount}</h3>
          <p className="mb-4">Approved</p>
          <p className="text-sm">Successfully approved</p>
          <div className="flex justify-end">
            <i className="fas fa-check-circle text-4xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-red-500 text-white p-6 rounded-lg">
          <h3 className="text-4xl font-bold mb-2">{rejectedCount}</h3>
          <p className="mb-4">Rejected</p>
          <p className="text-sm">Needs revision</p>
          <div className="flex justify-end">
            <i className="fas fa-times-circle text-4xl opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
