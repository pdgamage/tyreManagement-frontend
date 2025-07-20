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

interface RequestReportsProps {
  requests: Request[];
  role: "supervisor" | "technical-manager" | "customer-officer";
}

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

// Helper function to safely parse dates
const safeParseDate = (dateValue: Date | string | null | undefined): Date | null => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Helper function to safely get string values
const safeGetString = (value: string | null | undefined, fallback = "Unknown"): string => {
  return value && value.trim() ? value.trim() : fallback;
};

// Helper function to safely get numeric values
const safeGetNumber = (value: number | null | undefined, fallback = 0): number => {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
};

const RequestReports: React.FC<RequestReportsProps> = ({ requests, role }) => {
  // Filter out invalid requests and ensure data integrity
  const validRequests = useMemo(() => {
    return requests.filter(request =>
      request &&
      request.id &&
      request.status &&
      safeParseDate(request.submittedAt) !== null
    );
  }, [requests]);

  const stats = useMemo(() => {
    if (!validRequests.length) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        recentRequests: 0,
        yearlyRequests: 0,
        approvalRate: 0,
        totalTires: 0,
        avgProcessingTime: 0,
      };
    }

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const totalRequests = validRequests.length;

    const pendingRequests = validRequests.filter((r) =>
      role === "supervisor"
        ? r.status === "pending"
        : r.status === "supervisor approved"
    ).length;

    const approvedRequests = validRequests.filter((r) => {
      if (role === "supervisor") {
        return r.status === "supervisor approved";
      } else if (role === "technical-manager") {
        return r.status === "technical-manager approved";
      } else {
        return r.status === "complete" || r.status === "order placed";
      }
    }).length;

    const rejectedRequests = validRequests.filter((r) => r.status === "rejected").length;

    const recentRequests = validRequests.filter((r) => {
      const date = safeParseDate(r.submittedAt);
      return date && date > lastMonth;
    }).length;

    const yearlyRequests = validRequests.filter((r) => {
      const date = safeParseDate(r.submittedAt);
      return date && date > thisYear;
    }).length;

    const totalTires = validRequests.reduce((sum, r) => sum + safeGetNumber(r.quantity), 0);

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      recentRequests,
      yearlyRequests,
      approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0,
      totalTires,
      avgProcessingTime: totalRequests > 0 ? yearlyRequests / Math.max(new Date().getMonth() + 1, 1) : 0,
    };
  }, [validRequests, role]);

  const monthlyStats = useMemo(() => {
    if (!validRequests.length) return [];

    const monthCounts: { [key: string]: {
      month: string;
      requests: number;
      approved: number;
      rejected: number;
      pending: number;
      totalTires: number;
      avgTiresPerRequest: number;
    } } = {};

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize all months with proper structure
    let currentDate = new Date(sixMonthsAgo);
    while (currentDate <= now) {
      const key = currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthCounts[key] = {
        month: key,
        requests: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        totalTires: 0,
        avgTiresPerRequest: 0,
      };
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Process valid requests
    validRequests.forEach((request) => {
      const date = safeParseDate(request.submittedAt);
      if (!date || date < sixMonthsAgo) return;

      const key = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (monthCounts[key]) {
        const quantity = safeGetNumber(request.quantity);
        monthCounts[key].requests++;
        monthCounts[key].totalTires += quantity;

        // Categorize by status
        switch (request.status) {
          case "supervisor approved":
          case "technical-manager approved":
          case "engineer approved":
          case "complete":
          case "order placed":
            monthCounts[key].approved++;
            break;
          case "rejected":
            monthCounts[key].rejected++;
            break;
          case "pending":
            monthCounts[key].pending++;
            break;
        }
      }
    });

    // Calculate averages and return sorted data
    return Object.values(monthCounts)
      .map(month => ({
        ...month,
        avgTiresPerRequest: month.requests > 0 ? Number((month.totalTires / month.requests).toFixed(1)) : 0,
      }))
      .sort((a, b) => new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime());
  }, [validRequests]);

  const sectionStats = useMemo(() => {
    if (!validRequests.length) return [];

    const sections = validRequests.reduce((acc: { [key: string]: number }, curr) => {
      const section = safeGetString(curr.userSection, "Unknown Section");
      const quantity = safeGetNumber(curr.quantity);
      acc[section] = (acc[section] || 0) + quantity;
      return acc;
    }, {});

    return Object.entries(sections)
      .map(([name, value]) => ({
        name,
        value: value as number,
        percentage: 0 // Will be calculated after sorting
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Show top 8 sections
      .map((item, index, array) => {
        const total = array.reduce((sum, s) => sum + s.value, 0);
        return {
          ...item,
          percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0
        };
      });
  }, [validRequests]);

  const vehicleStats = useMemo(() => {
    if (!validRequests.length) return [];

    const vehicles = validRequests.reduce((acc: { [key: string]: number }, curr) => {
      const vehicleNumber = safeGetString(curr.vehicleNumber, "Unknown Vehicle");
      const quantity = safeGetNumber(curr.quantity);
      acc[vehicleNumber] = (acc[vehicleNumber] || 0) + quantity;
      return acc;
    }, {});

    return Object.entries(vehicles)
      .map(([vehicle, quantity]) => ({
        vehicle,
        quantity: quantity as number,
        requests: validRequests.filter(r => r.vehicleNumber === vehicle).length
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [validRequests]);

  const tireSizeStats = useMemo(() => {
    if (!validRequests.length) return [];

    const tireSizes = validRequests.reduce((acc: { [key: string]: number }, curr) => {
      const tireSize = safeGetString(curr.tireSize, "Unknown Size");
      const quantity = safeGetNumber(curr.quantity);
      acc[tireSize] = (acc[tireSize] || 0) + quantity;
      return acc;
    }, {});

    return Object.entries(tireSizes)
      .map(([size, quantity]) => ({
        size,
        quantity: quantity as number,
        requests: validRequests.filter(r => r.tireSize === size).length
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Show top 10 tire sizes
  }, [validRequests]);

  // Status distribution for pie chart
  const statusStats = useMemo(() => {
    if (!validRequests.length) return [];

    const statusCounts = validRequests.reduce((acc: { [key: string]: number }, curr) => {
      const status = curr.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' '),
        value: count as number,
        percentage: Number(((count as number / validRequests.length) * 100).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }, [validRequests]);

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.totalRequests}
            </span>
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({stats.yearlyRequests} this year)
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
          <div className="mt-2 flex items-center">
            <span className="text-3xl font-bold text-gray-900">
              {stats.pendingRequests}
            </span>
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
              {(
                stats.yearlyRequests / Math.max(new Date().getMonth() + 1, 1)
              ).toFixed(1)}
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
