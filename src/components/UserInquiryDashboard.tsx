import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Table, Button, Space, DatePicker, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Request } from '../types/request';
import { useRequests } from '../contexts/RequestContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const statusTagColors: Record<string, string> = {
  'pending': 'orange',
  'supervisor approved': 'blue',
  'supervisor rejected': 'red',
  'technical-manager approved': 'cyan',
  'technical-manager rejected': 'red',
  'engineer approved': 'green',
  'engineer rejected': 'red',
  'order placed': 'purple',
  'order cancelled': 'volcano',
  'complete': 'green',
};

const UserInquiryDashboard: React.FC = () => {
  const { requests, fetchRequests } = useRequests();
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filters, setFilters] = useState({
    vehicleNumber: '',
    status: '',
    orderNumber: '',
    supplierName: '',
    supplierPhone: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
        const requestDate = dayjs(req.createdAt || new Date());
        return requestDate.isAfter(startDate) && requestDate.isBefore(endDate);
      });
    }

    setFilteredRequests(result);
  }, [requests, filters]);

  const handleResetFilters = () => {
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
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicleNumber',
      key: 'vehicleNumber',
      width: 150,
    },
    {
      title: 'Tire Size',
      dataIndex: 'tireSize',
      key: 'tireSize',
      width: 120,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusTagColors[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
      width: 180,
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 160,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleViewDetails(record)}>
            View
          </Button>
        </Space>
      ),
      width: 100,
    },
  ];

  const handleViewDetails = (record: Request) => {
    // Implement view details logic here
    console.log('View details:', record);
  };

  return (
    <div className="p-4">
      <Card 
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Request Inquiry Dashboard</span>
            <div className="flex items-center space-x-2">
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchRequests()}
                size="small"
              >
                Refresh
              </Button>
            </div>
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Vehicle Number</div>
            <Input
              placeholder="Search by vehicle number"
              value={filters.vehicleNumber}
              onChange={(e) => setFilters({...filters, vehicleNumber: e.target.value})}
              allowClear
              prefix={<SearchOutlined />}
            />
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
            <Select
              placeholder="Select status"
              className="w-full"
              value={filters.status || undefined}
              onChange={(value) => setFilters({...filters, status: value})}
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
            <div className="text-sm font-medium text-gray-500 mb-1">Supplier Phone</div>
            <Input
              placeholder="Search by supplier phone"
              value={filters.supplierPhone}
              onChange={(e) => setFilters({...filters, supplierPhone: e.target.value})}
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
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} requests`,
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserInquiryDashboard;