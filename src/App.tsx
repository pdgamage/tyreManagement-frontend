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
import SupervisorRequestDetails from "./pages/SupervisorRequestDetails";
import TechnicalManagerRequestDetails from "./pages/TechnicalManagerRequestDetails";
import EngineerRequestDetails from "./pages/EngineerRequestDetails";
import CustomerOfficerRequestDetails from "./pages/CustomerOfficerRequestDetails";
import UserRequestDetails from "./pages/UserRequestDetails";
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
              <Route
                path="/supervisor/request/:id"
                element={<SupervisorRequestDetails />}
              />
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
              <Route
                path="/user/request/:id"
                element={
                  <RequireAuth role="user">
                    <Layout>
                      <PageTransition>
                        <UserRequestDetails />
                      </PageTransition>
                    </Layout>
                  </RequireAuth>
                }
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
}: {
  children: ReactNode;
  role: string;
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};
