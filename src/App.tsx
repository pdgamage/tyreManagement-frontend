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
import VehicleRegistration from "./pages/VehicleRegistration";
import Layout from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { useLocation } from "react-router-dom";
import "./styles/animations.css";
import PageTransition from "./components/PageTransition";

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
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in: redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Logged in but wrong role: redirect to their dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};
