import React, { useMemo } from "react";
import {
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
];

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
      // Handle null/undefined userSection
      const section = curr.userSection || 'Unknown Section';
      acc[section] = (acc[section] || 0) + curr.quantity;
      return acc;
    }, {});

    return Object.entries(sections)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [requests]);



  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {role === "supervisor" ? "Supervisor" : role === "technical-manager" ? "Technical Manager" : "Customer Officer"} Analytics
        </h2>
      </div>

      {/* Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase">Total Requests</h3>
          <div className="mt-1">
            <span className="text-2xl font-bold text-blue-600">{stats.totalRequests}</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase">Approved</h3>
          <div className="mt-1">
            <span className="text-2xl font-bold text-green-600">{stats.approvedRequests}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase">Pending</h3>
          <div className="mt-1">
            <span className="text-2xl font-bold text-amber-600">{stats.pendingRequests}</span>
          </div>
        </div>

        {/* Total Tires */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase">Total Tires</h3>
          <div className="mt-1">
            <span className="text-2xl font-bold text-purple-600">{stats.totalTires}</span>
          </div>
        </div>
      </div>

      {/* Simplified Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Trends</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Section Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Sections</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sectionStats}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {sectionStats.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simple Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Most Active Section:</span>
            <p className="font-medium">{sectionStats[0]?.name || "No data"}</p>
          </div>
          <div>
            <span className="text-gray-500">Approval Rate:</span>
            <p className="font-medium">{stats.approvalRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
