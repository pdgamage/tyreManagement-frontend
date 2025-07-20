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
} from "recharts";
import { Request } from "../types/request";

interface RequestReportsProps {
  requests: Request[];
  role: "supervisor" | "technical-manager" | "customer-officer";
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  const stats = useMemo(() => {
    if (!requests || requests.length === 0) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        recentRequests: 0,
        weeklyRequests: 0,
        monthlyRequests: 0,
        yearlyRequests: 0,
        totalTires: 0,
        avgProcessingTime: 0,
        approvalRate: 0,
        rejectionRate: 0,
        avgTiresPerRequest: 0,
        urgentRequests: 0,
        monthlyAverage: 0,
      };
    }

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Total requests assigned to this supervisor (already filtered in SupervisorDashboard)
    const totalRequests = requests.length;

    // Status-based counts for supervisor role
    const pendingRequests = requests.filter((r) => r.status === "pending").length;
    const approvedRequests = requests.filter((r) => r.status === "supervisor approved").length;
    const rejectedRequests = requests.filter((r) =>
      r.status === "rejected" &&
      r.supervisor_notes &&
      r.supervisor_notes.trim() !== ""
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

    const yearlyRequests = requests.filter((r) =>
      new Date(r.submittedAt) >= thisYear
    ).length;

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

    // Monthly average calculation
    const currentMonth = new Date().getMonth() + 1; // 1-based month
    const monthlyAverage = currentMonth > 0 ? yearlyRequests / currentMonth : 0;

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
      recentRequests,
      weeklyRequests,
      monthlyRequests,
      yearlyRequests,
      totalTires,
      avgProcessingTime,
      approvalRate,
      rejectionRate,
      avgTiresPerRequest,
      urgentRequests,
      monthlyAverage,
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
              Supervisor Analytics Dashboard
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
                  <span className="text-sm text-gray-500">({stats.yearlyRequests} this year)</span>
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

        {/* Monthly Average Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Monthly Average
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.monthlyAverage.toFixed(1)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">requests/month</span>
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
              <h3 className="text-blue-100 text-sm font-semibold uppercase tracking-wide">This Week</h3>
              <p className="text-3xl font-bold mt-2">{stats.weeklyRequests}</p>
              <p className="text-blue-100 text-sm mt-1">New requests</p>
            </div>
            <TrendingUpIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-100 text-sm font-semibold uppercase tracking-wide">Rejection Rate</h3>
              <p className="text-3xl font-bold mt-2">{stats.rejectionRate.toFixed(1)}%</p>
              <p className="text-red-100 text-sm mt-1">{stats.rejectedRequests} rejected</p>
            </div>
            <XCircleIcon className="h-12 w-12 text-red-200" />
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
