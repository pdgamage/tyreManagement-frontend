import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Table, Button, Space, DatePicker, Tag, Form, Row, Col, Alert, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, CarOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Request } from '../types/request';
import { useRequests } from '../contexts/RequestContext';
import { useVehicles } from '../contexts/VehicleContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserInquiryDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { requests = [], fetchRequests, isRefreshing } = useRequests();
  const { vehicles = [], fetchVehicles } = useVehicles();
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>(undefined);
  const [vehicleDetails, setVehicleDetails] = useState<{
    make?: string;
    model?: string;
    type?: string;
    department?: string;
    costCentre?: string;
  }>({});
  
  const [filters, setFilters] = useState({
    vehicleNumber: '',
    status: '',
    orderNumber: '',
    supplierName: '',
    supplierPhone: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  // Update filters when selected vehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      setFilters(prev => ({
        ...prev,
        vehicleNumber: selectedVehicle,
        status: '',
        orderNumber: '',
        supplierName: '',
        supplierPhone: ''
      }));

      // Find and set vehicle details
      const vehicle = vehicles.find(v => v.vehicleNumber === selectedVehicle);
      if (vehicle) {
        setVehicleDetails({
          make: vehicle.make || 'N/A',
          model: vehicle.model || 'N/A',
          type: vehicle.type || 'N/A',
          department: vehicle.department || 'N/A',
          costCentre: vehicle.costCentre || 'N/A'
        });
      }
    } else {
      setVehicleDetails({});
    }
  }, [selectedVehicle, vehicles]);

  // Update filtered requests when filters or requests change
  useEffect(() => {
    let result = [...requests];
    
    if (filters.vehicleNumber) {
      result = result.filter(request => 
        request.vehicleNumber?.toLowerCase() === filters.vehicleNumber.toLowerCase()
      );
    }
    
    if (filters.status) {
      result = result.filter(request => 
        request.status?.toLowerCase().includes(filters.status.toLowerCase())
      );
    }
    
    if (filters.orderNumber) {
      result = result.filter(request => 
        request.id?.toLowerCase().includes(filters.orderNumber.toLowerCase())
      );
    }
    
    if (filters.supplierName) {
      result = result.filter(request => 
        request.existingTireMake?.toLowerCase().includes(filters.supplierName.toLowerCase())
      );
    }
    
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0].startOf('day');
      const endDate = filters.dateRange[1].endOf('day');
      
      result = result.filter(request => {
        if (!request.submittedAt) return false;
        const requestDate = dayjs(request.submittedAt);
        return requestDate.isAfter(startDate) && requestDate.isBefore(endDate);
      });
    }
    
    setFilteredRequests(result);
  }, [filters, requests]);

  // Initialize data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both requests and vehicles in parallel
      await Promise.all([
        fetchRequests(),
        fetchVehicles(),
      ]);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRequests, fetchVehicles]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);



  useEffect(() => {
    let result = [...requests];

    if (filters.vehicleNumber) {
      result = result.filter(req => 
        req.vehicleNumber.toLowerCase().includes(filters.vehicleNumber.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(req => req.status === filters.status);
    }

    if (filters.orderNumber) {
      result = result.filter(req => 
        req.id?.toString().includes(filters.orderNumber)
      );
    }

    if (filters.supplierName) {
      // Assuming supplier information might be in comments or notes
      result = result.filter(req => 
        req.comments?.toLowerCase().includes(filters.supplierName.toLowerCase()) ||
        req.technical_manager_note?.toLowerCase().includes(filters.supplierName.toLowerCase()) ||
        req.engineer_note?.toLowerCase().includes(filters.supplierName.toLowerCase()) ||
        req.customer_officer_note?.toLowerCase().includes(filters.supplierName.toLowerCase())
      );
    }

    if (filters.supplierPhone) {
      // Assuming phone might be in comments or notes
      result = result.filter(req => 
        req.comments?.includes(filters.supplierPhone) ||
        req.technical_manager_note?.includes(filters.supplierPhone) ||
        req.engineer_note?.includes(filters.supplierPhone) ||
        req.customer_officer_note?.includes(filters.supplierPhone)
      );
    }

    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0].startOf('day');
      const endDate = filters.dateRange[1].endOf('day');
      
      result = result.filter(req => {
        const requestDate = dayjs(req.submittedAt || new Date());
        return requestDate.isAfter(startDate) && requestDate.isBefore(endDate);
      });
    }

    setFilteredRequests(result);
  }, [requests, filters]);

  const handleResetFilters = () => {
    setSelectedVehicle(undefined);
    setVehicleDetails({});
    setFilters({
      vehicleNumber: '',
      status: '',
      orderNumber: '',
      supplierName: '',
      supplierPhone: '',
      dateRange: null,
    });
  };

  const columns: ColumnsType<Request> = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => `#${text?.slice(0, 8) || 'N/A'}`,
      width: 120,
    },
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      sorter: (a: Request, b: Request) => (a.vehicleNumber || '').localeCompare(b.vehicleNumber || ''),
      width: 150,
    },
    {
      title: 'Tire Size',
      dataIndex: 'tireSize',
      key: 'tireSize',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string = '') => {
        let color = 'default';
        if (status === 'pending') color = 'orange';
        else if (status.includes('approved')) color = 'green';
        else if (status.includes('rejected')) color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status?.includes(value as string) || false,
      width: 180,
    },
    {
      title: 'Request Date',
      dataIndex: 'submittedAt',
      key: 'date',
      render: (date: string | Date | undefined) => {
        try {
          return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A';
        } catch (e) {
          return 'Invalid date';
        }
      },
      sorter: (a: Request, b: Request) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateA - dateB;
      },
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Request) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewDetails(record)}>View Details</Button>
        </Space>
      ),
    }
  ];

  const handleViewDetails = (record: Request) => {
    // Handle view details action
    console.log('View details:', record);
  };

  // Helper function to safely access Select value
  const handleStatusChange = (value: string | null) => {
    setFilters(prev => ({ ...prev, status: value || '' }));
  };

  console.log('Rendering with state:', { isLoading, error, requestsCount: requests.length, vehiclesCount: vehicles.length });

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              danger 
              onClick={loadData}
              loading={isLoading}
              className="mt-2"
            >
              Retry
            </Button>
          }
          className="mb-4"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tire Request Inquiry</h1>
        <p className="text-gray-600">View and manage tire replacement requests</p>
      </div>
      
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
            <Spin size="small" className="mr-2" />
            <span>Updating data...</span>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <Card 
          title={
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  <CarOutlined className="mr-2 text-blue-600" />
                  Vehicle Request Inquiry
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Search and filter tire requests by vehicle or request details
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />} 
                  onClick={() => {
                    fetchRequests();
                    handleResetFilters();
                  }}
                  size="middle"
                >
                  Refresh Data
                </Button>
              </div>
            </div>
          }
          bordered={false}
          className="shadow-sm"
        >
          {/* Vehicle Selection Card */}
          <Card 
            title="Select Vehicle" 
            size="small" 
            className="mb-6 bg-blue-50 border-0 shadow-sm"
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Form.Item label="Vehicle Number" className="mb-0">
                  <Select<string | undefined>
                    showSearch
                    placeholder="Select a vehicle"
                    optionFilterProp="children"
                    value={selectedVehicle}
                    onChange={(value: string | undefined) => setSelectedVehicle(value)}
                    filterOption={(input: string, option) => {
                      const children = option?.children as React.ReactNode;
                      const text = (Array.isArray(children) ? children[0] : children)?.toString() || '';
                      return text.toLowerCase().includes(input.toLowerCase());
                    }}
                    className="w-full"
                  >
                    <Select.Option value="">All Vehicles</Select.Option>
                    {Array.from(new Set(vehicles.map(v => v.vehicleNumber))).map((vNum) => (
                      <Select.Option key={vNum} value={vNum}>
                        {vNum}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              {selectedVehicle && (
                <Col xs={24} md={16}>
                  <div className="p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">Vehicle Details</h4>
                      <Tag color="blue" className="text-xs">
                        {vehicleDetails.type || 'Type not specified'}
                      </Tag>
                    </div>
                    <Row gutter={[16, 8]}>
                      <Col xs={12} sm={6}>
                        <div className="text-xs text-gray-500">Make</div>
                        <div className="font-medium">{vehicleDetails.make}</div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-xs text-gray-500">Model</div>
                        <div className="font-medium">{vehicleDetails.model}</div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-xs text-gray-500">Department</div>
                        <div className="font-medium">{vehicleDetails.department}</div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-xs text-gray-500">Cost Centre</div>
                        <div className="font-medium">{vehicleDetails.costCentre}</div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Filter Card */}
          <Card 
            title={
              <div className="flex items-center">
                <FilterOutlined className="mr-2 text-blue-600" />
                <span>Filter Requests</span>
              </div>
            } 
            size="small" 
            className="mb-6 bg-gray-50 border-0 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {!selectedVehicle && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-gray-500 mb-1">Vehicle Number</div>
                  <Input
                    placeholder="Search by vehicle number"
                    value={filters.vehicleNumber}
                    onChange={(e) => setFilters({...filters, vehicleNumber: e.target.value})}
                    allowClear
                    prefix={<SearchOutlined />}
                  />
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                <Select<string>
                  placeholder="Filter by status"
                  className="w-full"
                  value={filters.status || undefined}
                  onChange={handleStatusChange}
                  allowClear
                >
                  <Option value="pending">Pending</Option>
                  <Option value="supervisor approved">Supervisor Approved</Option>
                  <Option value="supervisor rejected">Supervisor Rejected</Option>
                  <Option value="technical-manager approved">Technical Manager Approved</Option>
                  <Option value="technical-manager rejected">Technical Manager Rejected</Option>
                  <Option value="engineer approved">Engineer Approved</Option>
                  <Option value="engineer rejected">Engineer Rejected</Option>
                  <Option value="order placed">Order Placed</Option>
                  <Option value="order cancelled">Order Cancelled</Option>
                  <Option value="complete">Complete</Option>
                </Select>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Order Number</div>
                <Input
                  placeholder="Search by order #"
                  value={filters.orderNumber}
                  onChange={(e) => setFilters({...filters, orderNumber: e.target.value})}
                  allowClear
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Supplier Name</div>
                <Input
                  placeholder="Search by supplier name"
                  value={filters.supplierName}
                  onChange={(e) => setFilters({...filters, supplierName: e.target.value})}
                  allowClear
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Date Range</div>
                <RangePicker
                  className="w-full"
                  value={filters.dateRange}
                  onChange={(dates) => setFilters({...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs]})}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  type="default" 
                  onClick={handleResetFilters}
                  className="w-full"
                  icon={<FilterOutlined />}
                  danger
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Request History Table */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="font-medium">Request History</span>
                <span className="text-sm text-gray-500">
                  Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                </span>
              </div>
            }
            size="small"
            className="border-0 shadow-sm"
          >
            <Table
              columns={columns}
              dataSource={filteredRequests}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} requests`,
                size: 'small',
                showQuickJumper: true,
              }}
              rowClassName={(record) => {
                const status = record.status || '';
                if (status === 'pending') return 'bg-yellow-50 hover:bg-yellow-100';
                if (status.includes('approved')) return 'bg-green-50 hover:bg-green-100';
                if (status.includes('rejected')) return 'bg-red-50 hover:bg-red-100';
                return 'hover:bg-gray-50';
              }}
              loading={!requests.length}
              locale={{
                emptyText: (
                  <div className="py-8 text-center">
                    <FileTextOutlined className="mx-auto text-4xl text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filters.vehicleNumber || filters.status || filters.orderNumber || filters.supplierName || filters.supplierPhone || filters.dateRange
                        ? 'Try adjusting your filters or search criteria.'
                        : 'No requests have been made yet.'}
                    </p>
                  </div>
                ),
              }}
            />
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default UserInquiryDashboard;