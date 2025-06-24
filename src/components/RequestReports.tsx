import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Request } from '../types/request';

interface RequestReportsProps {
  requests: Request[];
  role: 'supervisor' | 'technical-manager';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => 
      role === 'supervisor' ? r.status === 'pending' : r.status === 'supervisor approved'
    ).length;
    const approvedRequests = requests.filter(r => 
      role === 'supervisor' ? r.status === 'supervisor approved' : r.status === 'technical-manager approved'
    ).length;
    const recentRequests = requests.filter(r => new Date(r.submittedAt) > lastMonth).length;
    const yearlyRequests = requests.filter(r => new Date(r.submittedAt) > thisYear).length;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      recentRequests,
      yearlyRequests,
      approvalRate: (approvedRequests / totalRequests * 100) || 0
    };
  }, [requests, role]);

  const monthlyStats = useMemo(() => {
    const monthCounts: { [key: string]: any } = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize all months
    for (let d = sixMonthsAgo; d <= now; d.setMonth(d.getMonth() + 1)) {
      const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthCounts[key] = { month: key, requests: 0, approved: 0, rejected: 0, totalTires: 0 };
    }

    // Fill in actual data
    requests.forEach(request => {
      const date = new Date(request.submittedAt);
      if (date >= sixMonthsAgo) {
        const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (monthCounts[key]) {
          monthCounts[key].requests++;
          monthCounts[key].totalTires += request.quantity;
          if (request.status === 'supervisor approved' || request.status === 'technical-manager approved') {
            monthCounts[key].approved++;
          } else if (request.status === 'rejected') {
            monthCounts[key].rejected++;
          }
        }
      }
    });

    return Object.values(monthCounts);
  }, [requests]);

  const sectionStats = useMemo(() => {
    const sections = requests.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.userSection] = (acc[curr.userSection] || 0) + curr.quantity;
      return acc;
    }, {});

    return Object.entries(sections)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [requests]);

  const vehicleStats = useMemo(() => {
    const vehicles = requests.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.vehicleNumber] = (acc[curr.vehicleNumber] || 0) + curr.quantity;
      return acc;
    }, {});

    return Object.entries(vehicles)
      .map(([vehicle, quantity]) => ({ vehicle, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [requests]);

  const tireSizeStats = useMemo(() => {
    return Object.entries(
      requests.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.tireSize] = (acc[curr.tireSize] || 0) + curr.quantity;
        return acc;
      }, {})
    )
      .map(([size, quantity]) => ({ size, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">{stats.totalRequests}</span>
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({stats.yearlyRequests} this year)
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</span>
            <span className="ml-2 text-sm font-medium text-yellow-600">
              Needs attention
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Approval Rate</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.approvalRate.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Average</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {(stats.yearlyRequests / Math.max(new Date().getMonth() + 1, 1)).toFixed(1)}
            </span>
            <span className="ml-2 text-sm">requests/month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly Request Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="requests"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
              />
              <Area
                type="monotone"
                dataKey="approved"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Section Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top Sections by Tire Requests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectionStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectionStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top 10 Vehicles by Tire Requests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tire Size Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tire Size Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tireSizeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ size, percent }) => `${size} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantity"
              >
                {tireSizeStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Most Active Section</h4>
            <p className="text-xl font-semibold mt-1">{sectionStats[0]?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{sectionStats[0]?.value || 0} tires requested</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Most Common Tire Size</h4>
            <p className="text-xl font-semibold mt-1">{tireSizeStats[0]?.size || 'N/A'}</p>
            <p className="text-sm text-gray-500">{tireSizeStats[0]?.quantity || 0} units</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Average Request Processing</h4>
            <p className="text-xl font-semibold mt-1">
              {((stats.approvedRequests + stats.pendingRequests) / Math.max(monthlyStats.length, 1)).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">requests per month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
