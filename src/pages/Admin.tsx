import { useState, useEffect } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { Navigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
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
        display: value === index ? 'block' : 'none',
        visibility: value === index ? 'visible' : 'hidden',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!isAdmin) {
      setError(
        "Vous n'avez pas les permissions nécessaires pour accéder à cette page"
      );
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [isAdmin]);

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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              '& .MuiTab-root': {
                color: 'primary.main',
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 48,
                px: 3,
                '&.Mui-selected': {
                  color: 'text.secondary',
                  fontWeight: 'bold',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'text.secondary',
                height: 3,
                borderRadius: '3px 3px 0 0',
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
