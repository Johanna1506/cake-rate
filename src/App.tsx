import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { Profile } from "./pages/Profile";
import { RateCake } from "./pages/RateCake";
import { Navigation } from "./components/Navigation";
import { CakeHistory } from "./components/CakeHistory";
import { WeekManager } from "./pages/WeekManager";
import { Box, CircularProgress } from "@mui/material";
import { useSession, useUserDetails, useHasRole } from "@hooks/useAuthQuery";
import { UploadCake } from "./pages/UploadCake";

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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navigation />
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
        <Route
          path="/admin/weeks"
          element={
            <PrivateRoute requireAdmin={true}>
              <WeekManager />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router basename="/cake-rate">
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}
