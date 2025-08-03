import React, { useState, useEffect } from 'react';
import { Select, Input, Card, Table } from 'antd';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

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
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
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
        const uniqueVehicles = [...new Set(response.data.map((req: Request) => req.vehicleNumber))];
        setVehicles(uniqueVehicles);
        setRequests(response.data);
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">User Inquiry Dashboard</h2>
      
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
  );
};

export default UserInquiryDashboard;
