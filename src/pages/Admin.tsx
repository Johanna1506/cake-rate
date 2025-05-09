import { useState, useEffect, useCallback } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { Navigate, useSearchParams } from "react-router-dom";
import { useErrorHandler } from "@hooks/useErrorHandler";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Fade,
  Slide,
} from "@mui/material";
import { UserManager } from "@components/admin/UserManager";
import { WeekManager } from "@components/admin/WeekManager";
import { SeasonManager } from "@components/admin/SeasonManager";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      style={{
        display: value === index ? "block" : "none",
        visibility: value === index ? "visible" : "hidden",
      }}
      {...other}
    >
      <Fade in={value === index} timeout={500}>
        <Box sx={{ py: 2 }}>
          <Slide
            direction={value > index ? "left" : "right"}
            in={value === index}
            timeout={500}
          >
            <Box>{children}</Box>
          </Slide>
        </Box>
      </Fade>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    "aria-controls": `admin-tabpanel-${index}`,
  };
}

export function Admin() {
  const isAdmin = useHasRole("ADMIN");
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(() => {
    const tab = searchParams.get("tab");
    return tab ? parseInt(tab) : 0;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setTabValue(newValue);
    setSearchParams({ tab: newValue.toString() });
  };

  const handleAdminError = useCallback(() => {
    handleError(
      "Vous n'avez pas les permissions nécessaires pour accéder à cette page"
    );
    setLoading(false);
  }, [handleError]);

  useEffect(() => {
    if (!isAdmin) {
      handleAdminError();
      return;
    }
    setLoading(false);
  }, [isAdmin, handleAdminError]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Administration
        </Typography>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              height: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 48, sm: 64 },
              "& .MuiTab-root": {
                color: "primary.main",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                textTransform: "none",
                minHeight: { xs: 48, sm: 64 },
                px: { xs: 2, sm: 3 },
                whiteSpace: "nowrap",
                "&.Mui-selected": {
                  color: "text.secondary",
                  fontWeight: "bold",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "text.secondary",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
              "& .MuiTabs-scrollButtons": {
                color: "primary.main",
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              },
            }}
          >
            <Tab label="Gestion des utilisateurs" {...a11yProps(0)} />
            <Tab label="Gestion des saisons" {...a11yProps(1)} />
            <Tab label="Gestion des semaines" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UserManager isTabActive={tabValue === 0} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SeasonManager isTabActive={tabValue === 1} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <WeekManager isTabActive={tabValue === 2} />
        </TabPanel>
      </Box>
    </Container>
  );
}
