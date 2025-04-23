import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@context/ThemeContext";
import { Navigation } from "@components/Navigation";
import { Box, CircularProgress } from "@mui/material";
import { useSession, useUserDetails, useHasRole } from "@hooks/useAuthQuery";
import { ToastProvider } from "@components/Toast";

// Lazy load all pages
const Login = lazy(() => import("@pages/Login").then(module => ({ default: module.Login })));
const SignUp = lazy(() => import("@pages/SignUp").then(module => ({ default: module.SignUp })));
const ForgotPassword = lazy(() => import("@pages/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import("@pages/ResetPassword").then(module => ({ default: module.ResetPassword })));
const Home = lazy(() => import("@pages/Home").then(module => ({ default: module.Home })));
const Admin = lazy(() => import("@pages/Admin").then(module => ({ default: module.Admin })));
const Profile = lazy(() => import("@pages/Profile").then(module => ({ default: module.Profile })));
const RateCake = lazy(() => import("@pages/RateCake").then(module => ({ default: module.RateCake })));
const CakeHistory = lazy(() => import("@pages/CakeHistory").then(module => ({ default: module.CakeHistory })));
const UploadCake = lazy(() => import("@pages/UploadCake").then(module => ({ default: module.UploadCake })));
const CakeDetails = lazy(() => import("@pages/CakeDetails").then(module => ({ default: module.CakeDetails })));
const NotFound = lazy(() => import("@pages/NotFound").then(module => ({ default: module.NotFound })));

// Loading component
const Loading = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
    <CircularProgress />
  </Box>
);

function PrivateRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const { isLoading: userDetailsLoading } = useUserDetails(
    session?.session?.user?.id || ""
  );
  const isAdmin = useHasRole("ADMIN");
  const location = useLocation();

  const loading = sessionLoading || userDetailsLoading;
  const isAuthenticated = !!session?.session?.user;

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const location = useLocation();

  if (session?.session?.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const { isLoading: userDetailsLoading } = useUserDetails(
    session?.session?.user?.id || ""
  );

  const loading = sessionLoading || userDetailsLoading;

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navigation />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/cake-upload"
            element={
              <PrivateRoute>
                <UploadCake />
              </PrivateRoute>
            }
          />
          <Route
            path="/rate/:cakeId"
            element={
              <PrivateRoute>
                <RateCake />
              </PrivateRoute>
            }
          />
          <Route
            path="/cake-history"
            element={
              <PrivateRoute>
                <CakeHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/cake-history/:id"
            element={
              <PrivateRoute>
                <CakeDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin={true}>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <Router basename="/cake-rate/">
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
