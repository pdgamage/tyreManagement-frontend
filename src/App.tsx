import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequestProvider } from "./contexts/RequestContext";
import { VehicleProvider } from "./contexts/VehicleContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import TechnicalManagerDashboard from "./pages/TechnicalManagerDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import CustomerOfficerDashboard from "./pages/CustomerOfficerDashboard";
import VehicleRegistration from "./pages/VehicleRegistration";

import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { useLocation } from "react-router-dom";
import "./styles/animations.css";
import PageTransition from "./components/PageTransition";
import SharedRequestDetails from "./pages/SharedRequestDetails";
import TechnicalManagerRequestDetails from "./pages/TechnicalManagerRequestDetails";
import EngineerRequestDetails from "./pages/EngineerRequestDetails";
import CustomerOfficerRequestDetails from "./pages/CustomerOfficerRequestDetails";
import TireInquiryDashboard from "./pages/TireInquiryDashboard";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function App() {
  return (
    <VehicleProvider>
      <BrowserRouter>
        <AuthProvider>
          <RequestProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <PageTransition>
                      <Home />
                    </PageTransition>
                  </Layout>
                }
              />
              {/* Public routes (no login required) */}
              <Route
                path="/user"
                element={
                  <RequireAuth role="user">
                    <Layout>
                      <PageTransition>
                        <UserDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/user/inquiry-dashboard"
                element={
                  <RequireAuth allowedRoles={["user", "supervisor"]}>
                    <Layout>
                      <PageTransition>
                        <TireInquiryDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/user/request-details/:id"
                element={
                  <RequireAuth role="user">
                    <Layout>
                      <PageTransition>
                        <RequestDetailsPage />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/vehicle-registration"
                element={
                  <Layout>
                    <PageTransition>
                      <VehicleRegistration />
                    </PageTransition>
                  </Layout>
                }
              />

              {/* Single login route */}
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                }
              />
              {/* Protected routes */}
              <Route
                path="/supervisor/*"
                element={
                  <RequireAuth role="supervisor">
                    <Layout>
                      <PageTransition>
                        <SupervisorDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/technical-manager/*"
                element={
                  <RequireAuth role="technical-manager">
                    <Layout>
                      <PageTransition>
                        <TechnicalManagerDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/engineer/*"
                element={
                  <RequireAuth role="engineer">
                    <Layout>
                      <PageTransition>
                        <EngineerDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/customer-officer/*"
                element={
                  <RequireAuth role="customer-officer">
                    <Layout>
                      <PageTransition>
                        <CustomerOfficerDashboard />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />
              {/* Shared request details route for both user and supervisor */}
              <Route
                path="/request/:id"
                element={
                  <RequireAuth allowedRoles={["user", "supervisor"]}>
                    <Layout>
                      <PageTransition>
                        <SharedRequestDetails />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* Legacy routes - redirect to new shared route */}
              <Route
                path="/supervisor/request/:id"
                element={<Navigate to="/request/:id" replace />}
              />
              <Route
                path="/user/request/:id"
                element={<Navigate to="/request/:id" replace />}
              />

              {/* Other role specific routes */}
              <Route
                path="/technical-manager/request/:id"
                element={<TechnicalManagerRequestDetails />}
              />
              <Route
                path="/engineer/request/:id"
                element={<EngineerRequestDetails />}
              />
              <Route
                path="/customer-officer/request/:id"
                element={<CustomerOfficerRequestDetails />}
              />
            </Routes>
          </RequestProvider>
        </AuthProvider>
      </BrowserRouter>
    </VehicleProvider>
  );
}

// New component for protected routes
const RequireAuth = ({
  children,
  role,
  allowedRoles,
}: {
  children: ReactNode;
  role?: string;
  allowedRoles?: string[];
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific role is provided, check for exact match
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  // If allowed roles array is provided, check if user's role is in the array
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children as JSX.Element;
};