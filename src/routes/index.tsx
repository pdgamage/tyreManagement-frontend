import { createBrowserRouter } from "react-router-dom";
import UserDashboard from "../pages/UserDashboard";
import TireInquiryDashboard from "../pages/TireInquiryDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={["user", "admin"]}><UserDashboard /></ProtectedRoute>
  },
  {
    path: "/tire-inquiry",
    element: <ProtectedRoute allowedRoles={["user", "admin"]}><TireInquiryDashboard /></ProtectedRoute>
  }
]);
