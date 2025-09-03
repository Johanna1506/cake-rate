import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@context/ThemeContext";
import { useSignOut, useSession, useUserDetails, useHasRole } from "@hooks/useAuthQuery";
import { AppBar, Toolbar, Button, IconButton, Box, Menu, MenuItem, Avatar, Tooltip, ListItemIcon, ListItemText, Divider, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Home as HomeIcon, History as HistoryIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Login as LoginIcon, Logout as LogoutIcon, Person as PersonIcon, AdminPanelSettings as AdminIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { data: userDetails } = useUserDetails(session?.session?.user?.id || "");
  const isAdmin = useHasRole("ADMIN");
  const signOut = useSignOut();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchor);
  const [bottomValue, setBottomValue] = useState(0);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleGo = (to: string) => {
    handleMenuClose();
    navigate(to);
  };

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      handleMenuClose();
      navigate("/login");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Always close the menu when the route changes
    setMenuAnchor(null);
  }, [location.pathname]);

  const handleBottomChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/cake-history");
        break;
      case 2:
        setMenuAnchor(event.currentTarget as HTMLElement);
        break;
      case 3:
        toggleTheme();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <AppBar position="static" role="banner" sx={{ display: { xs: "none", md: "block" } }}>
        <Toolbar>
        <Box component={Link} to="/" aria-label="Accueil" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
          <img src={logo} alt="Logo de l'application" style={{ height: 40, marginRight: 12 }} />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {session?.session?.user ? (
          <>
            <Button color="inherit" component={Link} to="/" startIcon={<HomeIcon />}>
              Accueil
            </Button>
            <Button color="inherit" component={Link} to="/cake-history" startIcon={<HistoryIcon />}>
              Historique
            </Button>
            <Tooltip title="Profil">
              <IconButton color="inherit" onClick={handleMenuOpen} aria-haspopup="true" aria-expanded={isMenuOpen} aria-label="Ouvrir le menu utilisateur">
                <Avatar src={userDetails?.avatar_url || undefined} alt={`Avatar de ${userDetails?.name || "utilisateur"}`}>
                  {userDetails?.name?.[0] || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>Connexion</Button>
        )}

        <Tooltip title={mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}>
          <IconButton color="inherit" onClick={toggleTheme} aria-label={mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={menuAnchor}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          keepMounted
        >
          <MenuItem onClick={() => handleGo(`/profile/${session?.session?.user?.id}`)}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profil</ListItemText>
          </MenuItem>
          {isAdmin && (
            <MenuItem onClick={() => handleGo("/admin")}>
              <ListItemIcon>
                <AdminIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Administration</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>
        </Toolbar>
      </AppBar>

      {session?.session?.user && (
        <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.appBar, display: { xs: "block", md: "none" }, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
          <BottomNavigation value={bottomValue} onChange={handleBottomChange} showLabels>
            <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
            <BottomNavigationAction label="Historique" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Profil" icon={<Avatar sx={{ width: 24, height: 24 }} src={userDetails?.avatar_url || undefined}>{userDetails?.name?.[0] || "U"}</Avatar>} />
            <BottomNavigationAction label={mode === "dark" ? "Clair" : "Sombre"} icon={mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />} />
          </BottomNavigation>
        </Box>
      )}
    </>
  );
}
