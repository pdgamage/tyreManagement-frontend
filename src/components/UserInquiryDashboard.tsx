import React, { useState, useEffect } from 'react';
import { Select, Input, Card, Table } from 'antd';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';

interface UserInquiryDashboardProps {
  userId: number;
}

interface Request {
  id: number;
  vehicleNumber: string;
  status: string;
  orderNumber: string;
  supplier?: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

const UserInquiryDashboard: React.FC<UserInquiryDashboardProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [filters, setFilters] = useState({
    vehicleNumber: '',
    status: '',
    orderNumber: '',
    supplierName: '',
  });

  useEffect(() => {
    // Fetch vehicles associated with user's requests
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/requests/user/${userId}`);
        const data = response.data as Request[];
        const uniqueVehicles = [...new Set(data.map(req => req.vehicleNumber))];
        setVehicles(uniqueVehicles);
        setRequests(data);
        
        // Update counts
        setPendingCount(data.filter(req => req.status.toLowerCase() === 'pending').length);
        setApprovedCount(data.filter(req => req.status.toLowerCase() === 'approved').length);
        setRejectedCount(data.filter(req => req.status.toLowerCase() === 'rejected').length);
      } catch (error) {
        console.error('Error fetching user requests:', error);
      }
    };

    fetchVehicles();
  }, [userId]);

  const columns = [
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      sorter: (a: Request, b: Request) => a.vehicleNumber.localeCompare(b.vehicleNumber),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded ${getStatusColor(status)}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
    },
    {
      title: 'Supplier Phone',
      dataIndex: ['supplier', 'phone'],
      key: 'supplierPhone',
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Request, b: Request) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    return (
      (!filters.vehicleNumber || request.vehicleNumber === filters.vehicleNumber) &&
      (!filters.status || request.status.toLowerCase().includes(filters.status.toLowerCase())) &&
      (!filters.orderNumber || request.orderNumber?.includes(filters.orderNumber)) &&
      (!filters.supplierName || 
        request.supplier?.name.toLowerCase().includes(filters.supplierName.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-[#1e3a8a] text-white py-2 px-6 flex items-center">
        <div className="flex items-center gap-4">
          <span>📞 1717 (24x7)</span>
          <span>✉️ support@mobitel.lk</span>
        </div>
      </div>

      {/* Logo and Logout */}
      <div className="flex justify-between items-center px-6 py-4">
        <img src="/slt-mobitel-logo.png" alt="SLT Mobitel" className="h-8" />
        <button 
          onClick={() => navigate('/logout')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
        >
          <span>Logout</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex items-center gap-4 px-6 pb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <i className="fas fa-home" />
          Home
        </button>
        <button 
          onClick={() => navigate('/my-requests')}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg"
        >
          <i className="fas fa-list" />
          My Requests
        </button>
        <button 
          onClick={() => navigate('/register-vehicle')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <i className="fas fa-car" />
          Register Vehicle
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-gray-600">suresh user</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">User</span>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="bg-[#1e2a3b] text-white p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-4 rounded-lg">
              <i className="fas fa-clipboard-list text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">User Dashboard</h1>
              <p className="text-gray-300">Submit tire requests and track your applications</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">User Level Access</span>
                <span className="mx-2">•</span>
                <span className="text-sm">Welcome back, suresh user</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-4 py-2 rounded">
              <div className="text-sm text-gray-400">Current Time</div>
              <div className="font-semibold">1:22:19 PM</div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded">
              <div className="text-sm text-gray-400">Today's Date</div>
              <div className="font-semibold">8/3/2025</div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded">
              <span>suresh user</span>
              <span className="text-sm bg-emerald-500 px-2 py-0.5 rounded">User</span>
            </div>
            <button className="bg-emerald-500 p-2 rounded-lg hover:bg-emerald-600">
              <i className="fas fa-user text-xl" />
            </button>
          </div>
        </div>

        <button 
          onClick={() => navigate('/new-request')}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-plus" />
          <span className="font-medium">New Tire Request</span>
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-amber-500 text-white p-6 rounded-lg">
            <h3 className="text-4xl font-bold mb-2">{pendingCount || 0}</h3>
            <p className="mb-4">Pending Requests</p>
            <p className="text-sm">Awaiting review</p>
            <div className="flex justify-end">
              <i className="fas fa-clock text-4xl opacity-50" />
            </div>
          </div>
          
          <div className="bg-emerald-500 text-white p-6 rounded-lg">
            <h3 className="text-4xl font-bold mb-2">{approvedCount || 0}</h3>
            <p className="mb-4">Approved</p>
            <p className="text-sm">Successfully approved</p>
            <div className="flex justify-end">
              <i className="fas fa-check-circle text-4xl opacity-50" />
            </div>
          </div>
          
          <div className="bg-red-500 text-white p-6 rounded-lg">
            <h3 className="text-4xl font-bold mb-2">{rejectedCount || 0}</h3>
            <p className="mb-4">Rejected</p>
            <p className="text-sm">Needs revision</p>
            <div className="flex justify-end">
              <i className="fas fa-times-circle text-4xl opacity-50" />
            </div>
          </div>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Number
            </label>
            <Select
              className="w-full"
              placeholder="Select Vehicle Number"
              allowClear
              onChange={(value: string | null) => setFilters({ ...filters, vehicleNumber: value || '' })}
            >
              {vehicles.map((vehicle) => (
                <Select.Option key={vehicle} value={vehicle}>
                  {vehicle}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Request Status
            </label>
            <Select
              className="w-full"
              placeholder="Select Status"
              allowClear
              onChange={(value: string | null) => setFilters({ ...filters, status: value || '' })}
            >
              {['Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Order Number
            </label>
            <Input
              placeholder="Search by order number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, orderNumber: e.target.value })}
            />
          </div>
        </Card>

        <Card className="shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <Input
              placeholder="Search by supplier name"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, supplierName: e.target.value })}
            />
          </div>
        </Card>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number) => `Total ${total} items`,
          }}
        />
      </Card>
      </div>
    </div>
  );
};

export default UserInquiryDashboard;
