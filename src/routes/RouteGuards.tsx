import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useSession, useUserDetails, useHasRole } from "@hooks/useAuthQuery";

// Loading component
const Loading = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
    <CircularProgress />
  </Box>
);

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function PrivateRoute({
  children,
  requireAdmin = false,
}: PrivateRouteProps) {
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

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { data: session } = useSession();
  const location = useLocation();

  if (session?.session?.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
