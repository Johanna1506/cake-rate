import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@context/ThemeContext";
import {
  useSignOut,
  useSession,
  useUserDetails,
  useHasRole,
} from "@hooks/useAuthQuery";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import logo from "../assets/logo.png";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.primary.main,
}));

const StyledToolbar = styled(Toolbar)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const LogoContainer = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
}));

const Logo = styled("img")({
  height: 40,
  marginRight: 8,
});

const NavLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

const DesktopNav = styled(NavLinks)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

export function Navigation() {
  const navigate = useNavigate();
  const { toggleTheme, mode } = useTheme();
  const { data: session } = useSession();
  const { data: userDetails } = useUserDetails(
    session?.session?.user?.id || ""
  );
  const isAdmin = useHasRole("ADMIN");
  const signOut = useSignOut();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      handleUserMenuClose();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      onClick={handleUserMenuClose}
    >
      <MenuItem onClick={() => navigate("/profile")}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profil</ListItemText>
      </MenuItem>
      {isAdmin && (
        <MenuItem onClick={() => navigate("/admin")}>
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
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
    >
      <List>
        <ListItemButton component={Link} to="/" onClick={handleMobileMenuClose}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Accueil" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/cake-history"
          onClick={handleMobileMenuClose}
        >
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Historique" />
        </ListItemButton>
        {session?.session?.user ? (
          <>
            <ListItemButton onClick={handleUserMenuOpen}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={userDetails?.name || "Profil"} />
            </ListItemButton>
            {isAdmin && (
              <ListItemButton
                component={Link}
                to="/admin"
                onClick={handleMobileMenuClose}
              >
                <ListItemIcon>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText primary="Administration" />
              </ListItemButton>
            )}
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton
            component={Link}
            to="/login"
            onClick={handleMobileMenuClose}
          >
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Connexion" />
          </ListItemButton>
        )}
        <ListItemButton onClick={toggleTheme}>
          <ListItemIcon>
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === "dark" ? "Mode clair" : "Mode sombre"}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LogoContainer to="/">
          <Logo src={logo} alt="Logo" />
        </LogoContainer>

        <DesktopNav>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<HomeIcon />}
          >
            Accueil
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/cake-history"
            startIcon={<HistoryIcon />}
          >
            Historique
          </Button>
          {session?.session?.user ? (
            <>
              <Tooltip title="Profil">
                <IconButton
                  onClick={handleUserMenuOpen}
                  color="inherit"
                  size="large"
                >
                  <Avatar
                    src={userDetails?.avatar_url || undefined}
                    alt={userDetails?.name || "Avatar"}
                    sx={{ width: 32, height: 32 }}
                  >
                    {userDetails?.name?.[0] || "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
            >
              Connexion
            </Button>
          )}
          <Tooltip title={mode === "dark" ? "Mode clair" : "Mode sombre"}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </DesktopNav>

        <MobileMenuButton
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenuOpen}
        >
          <MenuIcon />
        </MobileMenuButton>
      </StyledToolbar>

      {renderMobileMenu()}
      {renderUserMenu()}
    </StyledAppBar>
  );
}
