import { FC, useState, useEffect } from 'react';
import { Select, DatePicker, Button, Card, Table } from 'antd';
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface VehicleRequest {
  id: string;
  vehicleNumber: string;
  requestDate: string;
  orderNumber: string;
  status: string;
  supplier?: {
    name: string;
    phoneNumber: string;
  };
  tireDetails?: {
    brand: string;
    size: string;
    quantity: number;
  };
}

const VehicleInquiry: FC = () => {
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<VehicleRequest | null>(null);

  // Fetch all vehicle numbers
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        const vehicleNumbers = response.data.map((vehicle: any) => vehicle.vehicleNumber);
        setVehicles(vehicleNumbers);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    fetchVehicles();
  }, []);

  // Handle vehicle search
  const handleSearch = async () => {
    if (!selectedVehicle) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/requests/vehicle/${selectedVehicle}`);
      setRequests(response.data);
      setRequestDetails(response.data[0] || null);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range search
  const handleDateRangeSearch = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/requests/report', {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Inquiry</h1>
      </div>

      {/* Search Section */}
      <Card className="shadow-md">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Search by Vehicle</h2>
            <div className="flex gap-4">
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Select Vehicle Number"
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                optionFilterProp="children"
              >
                {vehicles.map(vehicle => (
                  <Option key={vehicle} value={vehicle}>{vehicle}</Option>
                ))}
              </Select>
              <Button 
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Search
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Report by Date Range</h2>
            <div className="flex gap-4">
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              />
              <Button 
                type="primary"
                onClick={handleDateRangeSearch}
                loading={loading}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Request Details Section */}
      {requestDetails && (
        <Card className="shadow-md">
          <h2 className="text-lg font-semibold mb-4">Request Details</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-600">Order Information</h3>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">Order Number:</span> {requestDetails.orderNumber}</p>
                <p><span className="font-medium">Status:</span> {requestDetails.status}</p>
                <p><span className="font-medium">Request Date:</span> {dayjs(requestDetails.requestDate).format('YYYY-MM-DD')}</p>
              </div>
            </div>

            {requestDetails.supplier && (
              <div>
                <h3 className="font-medium text-gray-600">Supplier Information</h3>
                <div className="space-y-2 mt-2">
                  <p><span className="font-medium">Name:</span> {requestDetails.supplier.name}</p>
                  <p><span className="font-medium">Contact:</span> {requestDetails.supplier.phoneNumber}</p>
                </div>
              </div>
            )}

            {requestDetails.tireDetails && (
              <div>
                <h3 className="font-medium text-gray-600">Tire Details</h3>
                <div className="space-y-2 mt-2">
                  <p><span className="font-medium">Brand:</span> {requestDetails.tireDetails.brand}</p>
                  <p><span className="font-medium">Size:</span> {requestDetails.tireDetails.size}</p>
                  <p><span className="font-medium">Quantity:</span> {requestDetails.tireDetails.quantity}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Table */}
      <Card className="shadow-md">
        <h2 className="text-lg font-semibold mb-4">Request History</h2>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default VehicleInquiry;
