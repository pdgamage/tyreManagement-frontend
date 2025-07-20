import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Request } from "../types/request";

interface RequestReportsProps {
  requests: Request[];
  role: "supervisor" | "technical-manager" | "customer-officer";
}

// Professional color palette
const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

// Custom tooltip styles
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) =>
      role === "supervisor"
        ? r.status === "pending"
        : r.status === "supervisor approved"
    ).length;
    const approvedRequests = requests.filter((r) =>
      role === "supervisor"
        ? r.status === "supervisor approved"
        : r.status === "technical-manager approved"
    ).length;
    const rejectedRequests = requests.filter((r) => r.status === "rejected").length;
    const recentRequests = requests.filter(
      (r) => new Date(r.submittedAt) > lastMonth
    ).length;
    const weeklyRequests = requests.filter(
      (r) => new Date(r.submittedAt) > lastWeek
    ).length;
    const yearlyRequests = requests.filter(
      (r) => new Date(r.submittedAt) > thisYear
    ).length;
    const totalTires = requests.reduce((sum, r) => sum + r.quantity, 0);

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,
      weeklyRequests,
      yearlyRequests,
      totalTires,
      approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0,
      rejectionRate: totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0,
      avgTiresPerRequest: totalRequests > 0 ? totalTires / totalRequests : 0,
    };
  }, [requests, role]);

  const monthlyStats = useMemo(() => {
    const monthCounts: { [key: string]: any } = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize all months (use a new Date object for each iteration)
    let d = new Date(sixMonthsAgo);
    while (d <= now) {
      const key = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthCounts[key] = {
        month: key,
        requests: 0,
        approved: 0,
        rejected: 0,
        totalTires: 0,
      };
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1); // create a new Date object for the next month
    }

    // Fill in actual data
    requests.forEach((request) => {
      const date = new Date(request.submittedAt);
      if (date >= sixMonthsAgo) {
        const key = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        if (monthCounts[key]) {
          monthCounts[key].requests++;
          monthCounts[key].totalTires += request.quantity;
          if (
            request.status === "supervisor approved" ||
            request.status === "technical-manager approved"
          ) {
            monthCounts[key].approved++;
          } else if (request.status === "rejected") {
            monthCounts[key].rejected++;
          }
        }
      }
    });

    // Return months in chronological order
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          {role === "supervisor" ? "Supervisor" : role === "technical-manager" ? "Technical Manager" : "Customer Officer"} Analytics Dashboard
        </h2>
        <p className="text-blue-100">
          Comprehensive overview of tire request management and performance metrics
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Requests</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalRequests}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {stats.yearlyRequests} this year • {stats.weeklyRequests} this week
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pending Review</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-amber-600">
                  {stats.pendingRequests}
                </span>
                <div className="text-sm text-amber-600 mt-1 font-medium">
                  {stats.pendingRequests > 0 ? "Needs attention" : "All caught up!"}
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Approval Rate</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-green-600">
                  {stats.approvalRate.toFixed(1)}%
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {stats.approvedRequests} of {stats.totalRequests} approved
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Tires Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Tires</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-purple-600">
                  {stats.totalTires}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  Avg {stats.avgTiresPerRequest.toFixed(1)} per request
                </div>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="space-y-8">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Performance Analytics</h3>
          <div className="text-sm text-gray-500">
            Data updated in real-time
          </div>
        </div>

        {/* Primary Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Monthly Request Trends</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Total Requests
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Approved
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Section Distribution Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Department Distribution</h4>
              <div className="text-sm text-gray-500">
                Top 5 sections by tire requests
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sectionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {sectionStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Vehicle Analysis Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Vehicle Performance</h4>
              <div className="text-sm text-gray-500">
                Top 10 vehicles by tire requests
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={vehicleStats} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="vehicle"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="quantity"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tire Size Distribution Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Tire Size Analysis</h4>
              <div className="text-sm text-gray-500">
                Distribution by tire size
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={tireSizeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ size, percent }) =>
                    `${size} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="quantity"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {tireSizeStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Insights & Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Key Performance Insights</h3>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Live Data
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Most Active Section */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Most Active Section
              </h4>
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {sectionStats[0]?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {sectionStats[0]?.value || 0} tires requested
            </p>
          </div>

          {/* Most Common Tire Size */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Popular Tire Size
              </h4>
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {tireSizeStats[0]?.size || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {tireSizeStats[0]?.quantity || 0} units requested
            </p>
          </div>

          {/* Processing Efficiency */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Processing Rate
              </h4>
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {(stats.yearlyRequests / Math.max(new Date().getMonth() + 1, 1)).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">requests per month</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Success Rate
              </h4>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {stats.approvalRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {stats.rejectionRate.toFixed(1)}% rejection rate
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTires}</p>
              <p className="text-sm text-gray-500">Total Tires</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
