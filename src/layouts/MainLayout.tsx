import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Navigation } from "@components/Navigation";

export function MainLayout() {
  return (
    <Box sx={{ pb: { xs: "80px", sm: 0 } }}>
      <Navigation />
      <Outlet />
    </Box>
  );
}
