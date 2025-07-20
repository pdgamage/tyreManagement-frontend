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
  // Early return if no requests
  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500">No tire requests found to generate reports.</p>
        </div>
      </div>
    );
  }

  // Data validation and cleaning utility
  const cleanRequestData = (requests: Request[]) => {
    return requests.map(request => ({
      ...request,
      userSection: request.userSection || "Unknown Department",
      tireSize: request.tireSize || "Unknown Size",
      vehicleNumber: request.vehicleNumber || "Unknown Vehicle",
      quantity: request.quantity || 0
    }));
  };

  const cleanedRequests = cleanRequestData(requests);
  const stats = useMemo(() => {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const totalRequests = cleanedRequests.length;
    const pendingRequests = cleanedRequests.filter((r) =>
      role === "supervisor"
        ? r.status === "pending"
        : r.status === "supervisor approved"
    ).length;
    const approvedRequests = cleanedRequests.filter((r) =>
      role === "supervisor"
        ? r.status === "supervisor approved"
        : r.status === "technical-manager approved"
    ).length;
    const recentRequests = cleanedRequests.filter(
      (r) => new Date(r.submittedAt) > lastMonth
    ).length;
    const yearlyRequests = cleanedRequests.filter(
      (r) => new Date(r.submittedAt) > thisYear
    ).length;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      recentRequests,
      yearlyRequests,
      approvalRate: (approvedRequests / totalRequests) * 100 || 0,
    };
  }, [cleanedRequests, role]);

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
    cleanedRequests.forEach((request) => {
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
  }, [cleanedRequests]);

  const sectionStats = useMemo(() => {
    const sections = cleanedRequests.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.userSection] = (acc[curr.userSection] || 0) + curr.quantity;
      return acc;
    }, {});

    return Object.entries(sections)
      .map(([name, value]) => ({ name, value }))
      .filter(([name]) => name && name.trim() !== "" && name !== "Unknown Department") // Filter out unknown departments
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [cleanedRequests]);

  const vehicleStats = useMemo(() => {
    const vehicles = cleanedRequests.reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.vehicleNumber] = (acc[curr.vehicleNumber] || 0) + curr.quantity;
      return acc;
    }, {});

    return Object.entries(vehicles)
      .map(([vehicle, quantity]) => ({ vehicle, quantity }))
      .filter(([vehicle]) => vehicle && vehicle.trim() !== "" && vehicle !== "Unknown Vehicle") // Filter out unknown vehicles
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [cleanedRequests]);

  const tireSizeStats = useMemo(() => {
    return Object.entries(
      cleanedRequests.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.tireSize] = (acc[curr.tireSize] || 0) + curr.quantity;
        return acc;
      }, {})
    )
      .map(([size, quantity]) => ({ size, quantity }))
      .filter(([size]) => size && size.trim() !== "" && size !== "Unknown Size") // Filter out unknown sizes
      .sort((a, b) => b.quantity - a.quantity);
  }, [cleanedRequests]);

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
          {sectionStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectionStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name || 'Unknown'} (${(percent * 100).toFixed(0)}%)`
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
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No section data available</p>
            </div>
          )}
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
          {tireSizeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tireSizeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ size, percent }) =>
                    `${size || 'Unknown'} (${(percent * 100).toFixed(0)}%)`
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
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No tire size data available</p>
            </div>
          )}
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
              {sectionStats.length > 0 && sectionStats[0]?.name !== "Unknown Department"
                ? sectionStats[0].name
                : "No Data"}
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
              {tireSizeStats.length > 0 && tireSizeStats[0]?.size !== "Unknown Size"
                ? tireSizeStats[0].size
                : "No Data"}
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
