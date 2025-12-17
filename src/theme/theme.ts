import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        neutral: Palette['primary'];
    }
    interface PaletteOptions {
        neutral: PaletteOptions['primary'];
    }
}

// Création des thèmes clair et sombre avec des couleurs de gâteau
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#b0c4b1', // cake-cherry (rose cerise)
            light: '#b0c4b1', // cake-pink (rose clair)
            dark: '#4a5759', // rose foncé
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f7e1d7', // cake-brown (marron)
            light: '#f7e1d7', // marron clair
            dark: '#6b3e11', // marron foncé
            contrastText: '#ffffff',
        },
        background: {
            default: '#F1FFF2', // cake-yellow (jaune clair)
            paper: '#ffffff',
        },
        text: {
            primary: '#4a5759', // cake-brown (marron)
            secondary: '#84a59d', // marron clair
        },
        error: {
            main: '#d32f2f',
        },
        warning: {
            main: '#ed6c02',
        },
        info: {
            main: '#0288d1',
        },
        success: {
            main: '#2e7d32',
        },
        neutral: {
            main: '#64748B',
            light: '#94A3B8',
            dark: '#334155',
        },
    },
    typography: {
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#b0c4b1;',
                    borderRadius: 0,
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    '& .MuiBottomNavigationAction-root.Mui-selected': {
                        color: '#4a5759',
                    },
                    '& .MuiBottomNavigationAction-label.Mui-selected': {
                        fontWeight: 700,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#4a5759',
            light: '#84a59d',
            dark: '#b0c4b1',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#6b3e11',
            light: '#f7e1d7',
            dark: '#f7e1d7',
            contrastText: '#ffffff',
        },
        background: {
            default: '#334155',
            paper: '#4a5759',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0c4b1',
        },
        error: {
            main: '#d32f2f',
        },
        warning: {
            main: '#ed6c02',
        },
        info: {
            main: '#0288d1',
        },
        success: {
            main: '#2e7d32',
        },
        neutral: {
            main: '#94A3B8',
            light: '#64748B',
            dark: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e1e1e',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1e1e1e',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                },
            },
        },
    },
});

export const getTheme = (mode: 'light' | 'dark') => {
    const theme = mode === 'dark' ? darkTheme : lightTheme;
    return responsiveFontSizes(theme);
};