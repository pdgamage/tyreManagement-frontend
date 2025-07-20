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
} from "recharts";
import { Request } from "../types/request";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface RequestReportsProps {
  requests: Request[];
  role: "supervisor" | "technical-manager" | "customer-officer";
}

// Professional color palette for charts
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"];
const CHART_COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  lime: "#84CC16",
};

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  // Comprehensive statistics calculation
  const stats = useMemo(() => {
    if (!requests || requests.length === 0) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        completedRequests: 0,
        recentRequests: 0,
        weeklyRequests: 0,
        monthlyRequests: 0,
        yearlyRequests: 0,
        totalTires: 0,
        avgProcessingTime: 0,
        approvalRate: 0,
        rejectionRate: 0,
        completionRate: 0,
        yearOverYearGrowth: 0,
        monthOverMonthGrowth: 0,
        avgTiresPerRequest: 0,
        urgentRequests: 0,
      };
    }

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const lastYear = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    // Basic counts
    const totalRequests = requests.length;

    // Status-based filtering with role-specific logic
    const pendingRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return r.status === "pending";
      } else if (role === "technical-manager") {
        return r.status === "supervisor approved";
      } else {
        return r.status === "technical-manager approved";
      }
    }).length;

    const approvedRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return r.status === "supervisor approved";
      } else if (role === "technical-manager") {
        return r.status === "technical-manager approved";
      } else {
        return r.status === "completed" || r.status === "order placed";
      }
    }).length;

    const rejectedRequests = requests.filter((r) => r.status === "rejected").length;
    const completedRequests = requests.filter((r) =>
      r.status === "completed" || r.status === "order placed"
    ).length;

    // Time-based filtering
    const recentRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= lastMonth
    ).length;

    const weeklyRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= lastWeek
    ).length;

    const monthlyRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= thisMonth
    ).length;

    const lastMonthRequests = requests.filter((r) => {
      const submitDate = new Date(r.submittedAt);
      return submitDate >= lastMonthStart && submitDate < thisMonth;
    }).length;

    const yearlyRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= thisYear
    ).length;

    const lastYearRequests = requests.filter((r) => {
      const submitDate = new Date(r.submittedAt);
      return submitDate >= lastYear && submitDate <= lastYearEnd;
    }).length;

    // Tire calculations
    const totalTires = requests.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const avgTiresPerRequest = totalRequests > 0 ? totalTires / totalRequests : 0;

    // Processing time calculation (in days)
    const avgProcessingTime = requests.length > 0 ?
      requests.reduce((sum, r) => {
        const submitted = new Date(r.submittedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
        return sum + daysDiff;
      }, 0) / requests.length : 0;

    // Rate calculations
    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;
    const rejectionRate = totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0;
    const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

    // Growth calculations
    const yearOverYearGrowth = lastYearRequests > 0 ?
      ((yearlyRequests - lastYearRequests) / lastYearRequests) * 100 : 0;

    const monthOverMonthGrowth = lastMonthRequests > 0 ?
      ((monthlyRequests - lastMonthRequests) / lastMonthRequests) * 100 : 0;

    // Urgent requests (submitted in last 24 hours and still pending)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const urgentRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= yesterday && r.status === "pending"
    ).length;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      recentRequests,
      weeklyRequests,
      monthlyRequests,
      yearlyRequests,
      totalTires,
      avgProcessingTime,
      approvalRate,
      rejectionRate,
      completionRate,
      yearOverYearGrowth,
      monthOverMonthGrowth,
      avgTiresPerRequest,
      urgentRequests,
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
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* Professional Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {role === "supervisor" ? "Supervisor" :
               role === "technical-manager" ? "Technical Manager" :
               "Customer Officer"} Analytics Dashboard
            </h1>
            <p className="text-blue-100 text-lg">
              Comprehensive tire request management insights and performance metrics
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="bg-blue-500/30 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Real-time Data</span>
              </div>
              <div className="bg-blue-500/30 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <DocumentChartBarIcon className="h-20 w-20 text-blue-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Total Requests
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{stats.yearlyRequests} this year</span>
                  {stats.yearOverYearGrowth !== 0 && (
                    <div className={`flex items-center space-x-1 ${
                      stats.yearOverYearGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.yearOverYearGrowth > 0 ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">
                        {Math.abs(stats.yearOverYearGrowth).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Pending Review
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                <div className="flex items-center space-x-2">
                  {stats.urgentRequests > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      {stats.urgentRequests} urgent
                    </span>
                  )}
                  <span className="text-sm text-gray-500">Needs attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Approval Rate
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">{stats.approvalRate.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(stats.approvalRate, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {stats.approvedRequests} of {stats.totalRequests} approved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Time Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Avg Processing
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgProcessingTime.toFixed(1)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">days</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stats.avgProcessingTime <= 3 ? 'bg-green-100 text-green-800' :
                    stats.avgProcessingTime <= 7 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stats.avgProcessingTime <= 3 ? 'Excellent' :
                     stats.avgProcessingTime <= 7 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-100 text-sm font-semibold uppercase tracking-wide">Total Tires</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalTires.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">
                Avg {stats.avgTiresPerRequest.toFixed(1)} per request
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-semibold uppercase tracking-wide">This Month</h3>
              <p className="text-3xl font-bold mt-2">{stats.monthlyRequests}</p>
              <div className="flex items-center mt-1">
                {stats.monthOverMonthGrowth !== 0 && (
                  <div className={`flex items-center space-x-1 ${
                    stats.monthOverMonthGrowth > 0 ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {stats.monthOverMonthGrowth > 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(stats.monthOverMonthGrowth).toFixed(1)}% vs last month
                    </span>
                  </div>
                )}
              </div>
            </div>
            <TrendingUpIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Completion Rate</h3>
              <p className="text-3xl font-bold mt-2">{stats.completionRate.toFixed(1)}%</p>
              <p className="text-purple-100 text-sm mt-1">
                {stats.completedRequests} completed
              </p>
            </div>
            <DocumentChartBarIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-8">
        {/* Primary Chart - Monthly Trends */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Monthly Request Trends</h3>
              <p className="text-gray-600 mt-2">Track request volume and approval patterns over the last 6 months</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Total Requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Rejected</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={450}>
            <AreaChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke={CHART_COLORS.success}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorApproved)"
              />
              <Area
                type="monotone"
                dataKey="rejected"
                stroke={CHART_COLORS.danger}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRejected)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Section Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Top Sections by Tire Requests
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectionStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectionStats.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Top 10 Vehicles by Tire Requests
          </h3>
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
                label={({ size, percent }) =>
                  `${size} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantity"
              >
                {tireSizeStats.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
            <h4 className="text-sm font-medium text-gray-500">
              Most Active Section
            </h4>
            <p className="text-xl font-semibold mt-1">
              {sectionStats[0]?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {sectionStats[0]?.value || 0} tires requested
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Most Common Tire Size
            </h4>
            <p className="text-xl font-semibold mt-1">
              {tireSizeStats[0]?.size || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {tireSizeStats[0]?.quantity || 0} units
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Average Request Processing
            </h4>
            <p className="text-xl font-semibold mt-1">
              {(
                (stats.approvedRequests + stats.pendingRequests) /
                Math.max(monthlyStats.length, 1)
              ).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">requests per month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
