import React, { useMemo } from "react";
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
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { Request } from "../types/request";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

interface RequestReportsProps {
  requests: Request[];
  role: "supervisor" | "technical-manager" | "customer-officer";
}

// Professional color palette
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"];
const GRADIENT_COLORS = {
  primary: ["#3B82F6", "#1D4ED8"],
  success: ["#10B981", "#059669"],
  warning: ["#F59E0B", "#D97706"],
  danger: ["#EF4444", "#DC2626"],
  purple: ["#8B5CF6", "#7C3AED"],
};

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const lastYear = new Date(today.getFullYear() - 1, 0, 1);

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
    const lastYearRequests = requests.filter(
      (r) => new Date(r.submittedAt) > lastYear && new Date(r.submittedAt) < thisYear
    ).length;

    const totalTires = requests.reduce((sum, r) => sum + r.quantity, 0);
    const avgProcessingTime = requests.length > 0 ?
      requests.reduce((sum, r) => {
        const submitted = new Date(r.submittedAt);
        const processed = r.status !== "pending" ? new Date() : submitted;
        return sum + (processed.getTime() - submitted.getTime());
      }, 0) / requests.length / (1000 * 60 * 60 * 24) : 0; // in days

    const yearOverYearGrowth = lastYearRequests > 0 ?
      ((yearlyRequests - lastYearRequests) / lastYearRequests) * 100 : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,
      weeklyRequests,
      yearlyRequests,
      totalTires,
      avgProcessingTime,
      yearOverYearGrowth,
      approvalRate: (approvedRequests / totalRequests) * 100 || 0,
      rejectionRate: (rejectedRequests / totalRequests) * 100 || 0,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-blue-100">Comprehensive overview of tire request management</p>
          </div>
          <DocumentChartBarIcon className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Enhanced Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Requests</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalRequests}
                </span>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-gray-600">
                    {stats.yearlyRequests} this year
                  </span>
                  {stats.yearOverYearGrowth > 0 ? (
                    <div className="flex items-center ml-2 text-green-600">
                      <ArrowUpIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {stats.yearOverYearGrowth.toFixed(1)}%
                      </span>
                    </div>
                  ) : stats.yearOverYearGrowth < 0 ? (
                    <div className="flex items-center ml-2 text-red-600">
                      <ArrowDownIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {Math.abs(stats.yearOverYearGrowth).toFixed(1)}%
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pending Review</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.pendingRequests}
                </span>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Needs attention
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Approval Rate</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.approvalRate.toFixed(1)}%
                </span>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.approvalRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Processing Time Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Avg Processing</h3>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.avgProcessingTime.toFixed(1)}
                </span>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">days</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-100 text-sm font-medium uppercase tracking-wide">Total Tires</h3>
              <span className="text-3xl font-bold">{stats.totalTires}</span>
              <p className="text-green-100 text-sm mt-1">Units processed</p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">This Week</h3>
              <span className="text-3xl font-bold">{stats.weeklyRequests}</span>
              <p className="text-blue-100 text-sm mt-1">New requests</p>
            </div>
            <TrendingUpIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-100 text-sm font-medium uppercase tracking-wide">Rejection Rate</h3>
              <span className="text-3xl font-bold">{stats.rejectionRate.toFixed(1)}%</span>
              <p className="text-red-100 text-sm mt-1">Quality metric</p>
            </div>
            <XCircleIcon className="h-10 w-10 text-red-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="space-y-8">
        {/* Primary Chart - Monthly Trends */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Monthly Request Trends</h3>
              <p className="text-gray-600 text-sm mt-1">Track request volume and approval patterns over time</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Total Requests</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
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

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Sections by Tire Requests</h3>
              <p className="text-gray-600 text-sm mt-1">Distribution of requests across departments</p>
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
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {sectionStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Vehicle Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top 10 Vehicles by Tire Requests</h3>
              <p className="text-gray-600 text-sm mt-1">Most active vehicles requiring tire replacements</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={vehicleStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVehicle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="vehicle"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar
                  dataKey="quantity"
                  fill="url(#colorVehicle)"
                  radius={[4, 4, 0, 0]}
                  stroke="#8B5CF6"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Tire Size Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Tire Size Distribution</h3>
              <p className="text-gray-600 text-sm mt-1">Most requested tire sizes across all vehicles</p>
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
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="quantity"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {tireSizeStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
              <p className="text-gray-600 text-sm mt-1">Key performance indicators and trends</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Response Time</h4>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime.toFixed(1)} days</p>
                </div>
                <div className="text-blue-600">
                  <ClockIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Efficiency Rate</h4>
                  <p className="text-2xl font-bold text-gray-900">{(100 - stats.rejectionRate).toFixed(1)}%</p>
                </div>
                <div className="text-green-600">
                  <TrendingUpIcon className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Weekly Activity</h4>
                  <p className="text-2xl font-bold text-gray-900">{stats.weeklyRequests}</p>
                </div>
                <div className="text-purple-600">
                  <CalendarDaysIcon className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Insights */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Key Insights & Recommendations</h3>
          <p className="text-gray-600">Data-driven insights to optimize tire management operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <DocumentChartBarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Most Active Section
              </h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {sectionStats[0]?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              {sectionStats[0]?.value || 0} tires requested
            </p>
            <div className="mt-3 text-xs text-blue-600 font-medium">
              {sectionStats[0] && sectionStats.length > 1 ?
                `${((sectionStats[0].value / stats.totalTires) * 100).toFixed(1)}% of total requests` :
                'No data available'
              }
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Most Common Tire Size
              </h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {tireSizeStats[0]?.size || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              {tireSizeStats[0]?.quantity || 0} units
            </p>
            <div className="mt-3 text-xs text-green-600 font-medium">
              {tireSizeStats[0] && tireSizeStats.length > 1 ?
                `${((tireSizeStats[0].quantity / stats.totalTires) * 100).toFixed(1)}% of total tires` :
                'No data available'
              }
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <TrendingUpIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Monthly Processing Rate
              </h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {(
                stats.yearlyRequests / Math.max(new Date().getMonth() + 1, 1)
              ).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">requests per month</p>
            <div className="mt-3 text-xs text-purple-600 font-medium">
              {stats.yearOverYearGrowth > 0 ?
                `↗ ${stats.yearOverYearGrowth.toFixed(1)}% growth YoY` :
                stats.yearOverYearGrowth < 0 ?
                `↘ ${Math.abs(stats.yearOverYearGrowth).toFixed(1)}% decline YoY` :
                'No year-over-year data'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
