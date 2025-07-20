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

// Professional color palette for modern dashboard
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"];
const CHART_COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  lime: "#84CC16",
  gradient: {
    blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    green: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    purple: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  }
};

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  const stats = useMemo(() => {
    if (!requests || requests.length === 0) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        recentRequests: 0,
        yearlyRequests: 0,
        totalTires: 0,
        approvalRate: 0,
        rejectionRate: 0,
        monthlyAverage: 0,
      };
    }

    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // For supervisor role, only count requests that are in supervisor's workflow
    // (pending, supervisor approved, or rejected by supervisor)
    const supervisorWorkflowRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return (
          r.status === "pending" ||
          r.status === "supervisor approved" ||
          (r.status === "rejected" &&
           r.supervisor_notes &&
           r.supervisor_notes.trim() !== "")
        );
      }
      return true; // For other roles, count all requests
    });

    const totalRequests = supervisorWorkflowRequests.length;

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

    const rejectedRequests = requests.filter((r) =>
      r.status === "rejected" &&
      r.supervisor_notes &&
      r.supervisor_notes.trim() !== ""
    ).length;

    const recentRequests = supervisorWorkflowRequests.filter(
      (r) => new Date(r.submittedAt) > lastMonth
    ).length;

    const yearlyRequests = supervisorWorkflowRequests.filter(
      (r) => new Date(r.submittedAt) > thisYear
    ).length;

    // Calculate total tires for supervisor workflow requests only
    const totalTires = supervisorWorkflowRequests.reduce((sum, r) => sum + (r.quantity || 0), 0);

    // Calculate rates based on supervisor workflow requests
    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;
    const rejectionRate = totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0;

    // Monthly average calculation
    const currentMonth = new Date().getMonth() + 1;
    const monthlyAverage = currentMonth > 0 ? yearlyRequests / currentMonth : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,
      yearlyRequests,
      totalTires,
      approvalRate,
      rejectionRate,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6 space-y-8">
      {/* Professional Dashboard Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 transform translate-x-16 -translate-y-8">
          <div className="w-40 h-40 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 transform -translate-x-16 translate-y-8">
          <div className="w-32 h-32 bg-white opacity-10 rounded-full"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Supervisor Analytics
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Professional Dashboard & Insights
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm font-semibold">🔴 Live Data</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm font-semibold">📅 {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block relative z-10">
            <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRequests}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                ✨ Active Workflow
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {stats.yearlyRequests} this year
              </span>
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-yellow-100 p-3 rounded-xl group-hover:bg-yellow-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ⚡ Needs Attention
              </span>
              <span className="text-sm text-gray-600 font-medium">
                Priority items
              </span>
            </div>
          </div>
        </div>

        {/* Approved Requests Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Approved Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approvedRequests}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✅ Successfully Approved
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {stats.totalRequests > 0 ? ((stats.approvedRequests / stats.totalRequests) * 100).toFixed(1) : 0}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Rejected Requests Card */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          <div className="relative p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition-colors duration-300">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rejected Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rejectedRequests}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                ❌ Quality Control
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {stats.totalRequests > 0 ? ((stats.rejectedRequests / stats.totalRequests) * 100).toFixed(1) : 0}% of total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8">
            <div className="w-24 h-24 bg-white opacity-20 rounded-full"></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-emerald-100 text-sm font-bold uppercase tracking-wider">Total Tires Managed</h3>
              <p className="text-4xl font-bold mt-2">{stats.totalTires.toLocaleString()}</p>
              <p className="text-emerald-100 text-sm mt-2 font-medium">
                📦 Avg {stats.avgTiresPerRequest ? stats.avgTiresPerRequest.toFixed(1) : '0'} per request
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8">
            <div className="w-24 h-24 bg-white opacity-20 rounded-full"></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-blue-100 text-sm font-bold uppercase tracking-wider">Recent Activity</h3>
              <p className="text-4xl font-bold mt-2">{stats.recentRequests}</p>
              <p className="text-blue-100 text-sm mt-2 font-medium">
                📈 Last 30 days
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8">
            <div className="w-24 h-24 bg-white opacity-20 rounded-full"></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-purple-100 text-sm font-bold uppercase tracking-wider">Workflow Efficiency</h3>
              <p className="text-4xl font-bold mt-2">{stats.totalRequests > 0 ? (((stats.approvedRequests + stats.rejectedRequests) / stats.totalRequests) * 100).toFixed(1) : 0}%</p>
              <p className="text-purple-100 text-sm mt-2 font-medium">
                ⚡ Processed requests
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-8">
        {/* Primary Chart - Monthly Trends */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">📊 Monthly Request Trends</h3>
                <p className="text-gray-600 mt-2">Track request volume and approval patterns over the last 6 months</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Total Requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Rejected</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRejected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              Decision Summary
            </h4>
            <p className="text-xl font-semibold mt-1">
              {stats.approvedRequests + stats.rejectedRequests}
            </p>
            <p className="text-sm text-gray-500">
              {stats.approvedRequests} approved, {stats.rejectedRequests} rejected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
