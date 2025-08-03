import { FC, useState, useEffect } from 'react';
import { Select, DatePicker, Button, Card, Table, Input, AutoComplete, message, Spin } from 'antd';
import axios from 'axios';
import { SearchOutlined, FileSearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_CONFIG } from '../config/api';

const { RangePicker } = DatePicker;

interface Vehicle {
  id: string;
  vehicleNumber: string;
  registrationDate: string;
  vehicleType: string;
  division?: string;
}

interface VehicleRequest {
  id: string;
  vehicleNumber: string;
  requestDate: string;
  orderNumber: string;
  status: string;
  rejectionReason?: string;
  approvedDate?: string;
  expectedDeliveryDate?: string;
  orderDate?: string;
  requestType: string;
  urgencyLevel: string;
  supplier?: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  };
  tireDetails?: {
    brand: string;
    size: string;
    quantity: number;
    pattern?: string;
    position?: string;
    currentReading?: number;
    lastReplacementDate?: string;
    replacementReason?: string;
  };
}

const VehicleInquiry: FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<VehicleRequest | null>(null);

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VEHICLES}`);
        setVehicles(response.data);
        setFilteredVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        message.error('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Handle vehicle search
  const handleSearch = async () => {
    if (!selectedVehicle) {
      message.warning('Please select a vehicle number');
      return;
    }
    
    setLoading(true);
    try {
      // Fetch requests using vehicle number
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`, {
        params: { vehicleNumber: selectedVehicle }
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setRequests(response.data);
        setRequestDetails(response.data[0]);
        message.success(`Found ${response.data.length} requests for vehicle ${selectedVehicle}`);
        }));

        setRequests(formattedRequests);
        setRequestDetails(formattedRequests[0]);
        message.success(`Found ${formattedRequests.length} requests for vehicle ${selectedVehicle}`);
      } else {
        setRequests([]);
        setRequestDetails(null);
        message.info(`No requests found for vehicle ${selectedVehicle}`);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      message.error(error.response?.data?.message || 'Failed to fetch request details');
      setRequests([]);
      setRequestDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle date range search
  const handleDateRangeSearch = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning('Please select a date range');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}/report`, {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        },
      });
      
      if (response.data && response.data.length > 0) {
        setRequests(response.data);
        message.success(`Found ${response.data.length} requests in the selected date range`);
      } else {
        setRequests([]);
        message.info('No requests found in the selected date range');
      }
      setRequestDetails(null); // Clear detailed view when showing report
    } catch (error) {
      console.error('Error fetching report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      sorter: (a: VehicleRequest, b: VehicleRequest) => a.orderNumber.localeCompare(b.orderNumber),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: string, record: VehicleRequest) => record.status === value,
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
          status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      width: '20%',
      render: (text: string, record: VehicleRequest) => record.supplier?.name || 'Not assigned',
    },
    {
      title: 'Contact Number',
      dataIndex: ['supplier', 'phoneNumber'],
      key: 'supplierPhone',
      width: '15%',
      render: (text: string, record: VehicleRequest) => record.supplier?.phoneNumber || 'N/A',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: '15%',
      sorter: (a: VehicleRequest, b: VehicleRequest) => 
        dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: '15%',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'Not set',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      fixed: 'right',
      render: (_, record: VehicleRequest) => (
        <Button
          type="link"
          onClick={() => setRequestDetails(record)}
        >
          View Details
        </Button>
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
              <AutoComplete
                dropdownMatchSelectWidth={false}
                style={{ width: '100%' }}
                placeholder="Type vehicle number to search"
                options={filteredVehicles.map(vehicle => ({
                  value: vehicle.vehicleNumber,
                  label: (
                    <div className="flex flex-col py-1">
                      <div className="font-medium text-base">{vehicle.vehicleNumber}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {vehicle.vehicleType}
                        </span>
                        {vehicle.division && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {vehicle.division}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }))}
                value={searchText}
                onChange={(value) => {
                  setSearchText(value);
                  setSelectedVehicle(value);
                  setSearchLoading(true);
                  const filtered = vehicles.filter(v => 
                    v.vehicleNumber.toLowerCase().includes(value.toLowerCase()) ||
                    v.vehicleType.toLowerCase().includes(value.toLowerCase()) ||
                    (v.division && v.division.toLowerCase().includes(value.toLowerCase()))
                  );
                  setFilteredVehicles(filtered);
                  setSearchLoading(false);
                }}
                onSelect={(value) => {
                  setSelectedVehicle(value);
                  setSearchText(value);
                  handleSearch(); // Automatically search when a vehicle is selected
                }}
                notFoundContent={searchLoading ? <Spin size="small" /> : "No vehicles found"}
                filterOption={(inputValue, option) =>
                  option?.value.toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                }
              />
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
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    requestDetails.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    requestDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    requestDetails.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {requestDetails.status}
                  </span>
                </p>
                <p><span className="font-medium">Request Type:</span> {requestDetails.requestType}</p>
                <p><span className="font-medium">Urgency Level:</span> {requestDetails.urgencyLevel}</p>
                <p><span className="font-medium">Request Date:</span> {dayjs(requestDetails.requestDate).format('YYYY-MM-DD')}</p>
                {requestDetails.approvedDate && (
                  <p><span className="font-medium">Approved Date:</span> {dayjs(requestDetails.approvedDate).format('YYYY-MM-DD')}</p>
                )}
                {requestDetails.orderDate && (
                  <p><span className="font-medium">Order Date:</span> {dayjs(requestDetails.orderDate).format('YYYY-MM-DD')}</p>
                )}
                {requestDetails.expectedDeliveryDate && (
                  <p><span className="font-medium">Expected Delivery:</span> {dayjs(requestDetails.expectedDeliveryDate).format('YYYY-MM-DD')}</p>
                )}
                {requestDetails.rejectionReason && (
                  <p><span className="font-medium">Rejection Reason:</span> {requestDetails.rejectionReason}</p>
                )}
              </div>
            </div>

            {requestDetails.supplier && (
              <div>
                <h3 className="font-medium text-gray-600">Supplier Information</h3>
                <div className="space-y-2 mt-2">
                  <p><span className="font-medium">Name:</span> {requestDetails.supplier.name}</p>
                  <p><span className="font-medium">Contact:</span> {requestDetails.supplier.phoneNumber}</p>
                  {requestDetails.supplier.email && (
                    <p><span className="font-medium">Email:</span> {requestDetails.supplier.email}</p>
                  )}
                  {requestDetails.supplier.address && (
                    <p><span className="font-medium">Address:</span> {requestDetails.supplier.address}</p>
                  )}
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
                  {requestDetails.tireDetails.pattern && (
                    <p><span className="font-medium">Pattern:</span> {requestDetails.tireDetails.pattern}</p>
                  )}
                  {requestDetails.tireDetails.position && (
                    <p><span className="font-medium">Position:</span> {requestDetails.tireDetails.position}</p>
                  )}
                  {requestDetails.tireDetails.currentReading && (
                    <p><span className="font-medium">Current Reading:</span> {requestDetails.tireDetails.currentReading}</p>
                  )}
                  {requestDetails.tireDetails.lastReplacementDate && (
                    <p><span className="font-medium">Last Replacement:</span> {dayjs(requestDetails.tireDetails.lastReplacementDate).format('YYYY-MM-DD')}</p>
                  )}
                  {requestDetails.tireDetails.replacementReason && (
                    <p><span className="font-medium">Replacement Reason:</span> {requestDetails.tireDetails.replacementReason}</p>
                  )}
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
