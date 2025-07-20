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
  role: "supervisor" | "technical-manager" | "customer-officer" | "engineer";
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

    // Filter requests based on role workflow
    const workflowRequests = requests.filter((r) => {
      if (role === "supervisor") {
        // Supervisor sees: pending, supervisor approved, or rejected by supervisor
        return (
          r.status === "pending" ||
          r.status === "supervisor approved" ||
          (r.status === "rejected" &&
           r.supervisor_notes &&
           r.supervisor_notes.trim() !== "")
        );
      } else if (role === "technical-manager") {
        // Technical manager sees: supervisor approved, technical-manager approved, or rejected by technical manager
        return (
          r.status === "supervisor approved" ||
          r.status === "technical-manager approved" ||
          (r.status === "rejected" &&
           r.technical_manager_notes &&
           r.technical_manager_notes.trim() !== "")
        );
      } else if (role === "engineer") {
        // Engineer sees: technical-manager approved (pending work), complete (finished work), and rejected by engineer
        return (
          r.status === "technical-manager approved" ||
          r.status === "complete" ||
          (r.status === "rejected" &&
           r.engineer_note &&
           r.engineer_note.trim() !== "")
        );
      } else if (role === "customer-officer") {
        // Customer officer sees: complete (ready for orders), order placed, and rejected by customer officer
        return (
          r.status === "complete" ||
          r.status === "order placed" ||
          (r.status === "rejected" &&
           r.customer_officer_note &&
           r.customer_officer_note.trim() !== "")
        );
      }
      return true; // For other roles, count all requests
    });

    const totalRequests = workflowRequests.length;

    const pendingRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return r.status === "pending";
      } else if (role === "technical-manager") {
        return r.status === "supervisor approved";
      } else if (role === "engineer") {
        return r.status === "technical-manager approved"; // Engineer sees technical-manager approved as pending work
      } else if (role === "customer-officer") {
        return r.status === "complete"; // Customer officer sees complete requests as pending orders
      }
      return r.status === "supervisor approved"; // Default for other roles
    }).length;

    const approvedRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return r.status === "supervisor approved";
      } else if (role === "technical-manager") {
        // Technical manager approved requests include both "technical-manager approved" and "complete"
        return r.status === "technical-manager approved" || r.status === "complete";
      } else if (role === "engineer") {
        // Engineer completed requests
        return r.status === "complete";
      } else if (role === "customer-officer") {
        // Customer officer placed orders
        return r.status === "order placed";
      }
      return r.status === "technical-manager approved" || r.status === "complete"; // Default for other roles
    }).length;

    const rejectedRequests = requests.filter((r) => {
      if (role === "supervisor") {
        return (
          r.status === "rejected" &&
          r.supervisor_notes &&
          r.supervisor_notes.trim() !== ""
        );
      } else if (role === "technical-manager") {
        return (
          r.status === "rejected" &&
          r.technical_manager_notes &&
          r.technical_manager_notes.trim() !== ""
        );
      } else if (role === "engineer") {
        return (
          r.status === "rejected" &&
          r.engineer_note &&
          r.engineer_note.trim() !== ""
        );
      } else if (role === "customer-officer") {
        return (
          r.status === "rejected" &&
          r.customer_officer_note &&
          r.customer_officer_note.trim() !== ""
        );
      }
      return r.status === "rejected"; // Default for other roles
    }).length;

    const recentRequests = workflowRequests.filter(
      (r) => new Date(r.submittedAt) > lastMonth
    ).length;

    const yearlyRequests = workflowRequests.filter(
      (r) => new Date(r.submittedAt) > thisYear
    ).length;

    // Calculate total tires for workflow requests only
    const totalTires = workflowRequests.reduce((sum, r) => sum + (r.quantity || 0), 0);

    // Calculate rates based on workflow requests
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
      // Only include sections that have valid names
      if (curr.userSection && curr.userSection.trim() !== '') {
        acc[curr.userSection] = (acc[curr.userSection] || 0) + curr.quantity;
      }
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
          <h3 className="text-gray-500 text-sm font-medium">
            {role === "customer-officer" ? "Total Orders" : "Total Requests"}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.totalRequests}
            </span>
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({stats.yearlyRequests} this year)
            </span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {role === "customer-officer" ? "Order workflow" : "Active workflow only"}
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">
            {role === "customer-officer" ? "Pending Orders" : "Pending Review"}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.pendingRequests}
            </span>
            <span className="ml-2 text-sm font-medium text-yellow-600">
              {role === "customer-officer" ? "Ready to order" : "Needs attention"}
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">
            {role === "customer-officer" ? "Orders Placed" : "Approved Requests"}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-green-600">
              {stats.approvedRequests}
            </span>
            <span className="ml-2 text-sm font-medium text-green-500">
              {stats.approvalRate.toFixed(1)}% {role === "customer-officer" ? "order rate" : "approval rate"}
            </span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {role === "customer-officer" ? "Orders completed" : "Successfully processed"}
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">
            {role === "customer-officer" ? "Cancelled Orders" : "Rejected Requests"}
          </h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-red-600">
              {stats.rejectedRequests}
            </span>
            <span className="ml-2 text-sm font-medium text-red-500">
              {stats.rejectionRate.toFixed(1)}% {role === "customer-officer" ? "cancellation rate" : "rejection rate"}
            </span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {role === "customer-officer" ? "Cancelled orders" : "Declined requests"}
            </span>
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
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Key Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Most Active Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Most Active Section
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {sectionStats.length > 0 && sectionStats[0]?.name ? sectionStats[0].name : "No Data"}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {sectionStats.length > 0 ? `${sectionStats[0]?.value || 0} tires requested` : "No requests found"}
              </p>
            </div>
          </div>

          {/* Most Common Tire Size */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Most Common Tire Size
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {tireSizeStats.length > 0 && tireSizeStats[0]?.size ? tireSizeStats[0].size : "No Data"}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {tireSizeStats.length > 0 ? `${tireSizeStats[0]?.quantity || 0} units` : "No requests found"}
              </p>
            </div>
          </div>

          {/* Average Request Processing */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Average Processing
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {monthlyStats.length > 0 ? (
                  (stats.approvedRequests + stats.pendingRequests) /
                  Math.max(monthlyStats.length, 1)
                ).toFixed(1) : "0.0"}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                requests per month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestReports;
