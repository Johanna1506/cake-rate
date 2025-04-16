import { useState, useEffect } from 'react';
import { useSession, useHasRole } from '@hooks/useAuthQuery';
import { supabase } from '../lib/supabaseClient';
import { Navigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from '@mui/material';
import { UserManager } from './UserManager';
import { WeekManager } from './WeekManager';

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
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `admin-tab-${index}`,
        'aria-controls': `admin-tabpanel-${index}`,
    };
}

export function Admin() {
    const { data: session } = useSession();
    const isAdmin = useHasRole('ADMIN');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if (!isAdmin) {
            setError('Vous n\'avez pas les permissions nécessaires pour accéder à cette page');
            setLoading(false);
            return;
        }

        const fetchAdminData = async () => {
            try {
                // Fetch admin data here
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Une erreur est survenue lors du chargement des données');
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [isAdmin]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="admin tabs"
                    >
                        <Tab label="Gestion des utilisateurs" {...a11yProps(0)} />
                        <Tab label="Gestion des semaines" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <UserManager />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <WeekManager />
                </TabPanel>
            </Box>
        </Container>
    );
} 