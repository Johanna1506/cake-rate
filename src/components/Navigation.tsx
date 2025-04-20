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
  Collapse,
  alpha,
} from "@mui/material";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import logo from "../assets/logo.png";
import React from "react";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.primary.main, 0.9),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 10px rgba(0, 0, 0, 0.2)'
    : '0 2px 10px rgba(0, 0, 0, 0.1)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 4),
  },
}));

const LogoContainer = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Logo = styled("img")({
  height: 45,
  marginRight: 12,
  transition: 'all 0.3s ease-in-out',
});

const NavLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const NavButton = styled(Button)<{ component?: React.ElementType; to?: string }>(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    transform: 'translateY(-1px)',
  },
  '& .MuiButton-startIcon': {
    transition: 'transform 0.2s ease-in-out',
  },
  '&:hover .MuiButton-startIcon': {
    transform: 'scale(1.1)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    borderColor: alpha(theme.palette.common.white, 0.4),
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    borderRadius: '20px 0 0 20px',
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.95)
      : alpha(theme.palette.background.paper, 0.98),
    backdropFilter: 'blur(10px)',
    borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const StyledDrawerWithRef = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof StyledDrawer>>((props, ref) => (
  <StyledDrawer {...props} ref={ref} />
));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.08),
  },
}));

const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.grey[800], 0.95)
      : alpha(theme.palette.grey[700], 0.95),
    backdropFilter: 'blur(10px)',
    fontSize: '0.875rem',
    padding: '4px 8px',
    borderRadius: '4px',
  },
}));

const StyledTooltipWithRef = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof StyledTooltip>>((props, ref) => (
  <StyledTooltip {...props} ref={ref} />
));

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

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: '200px',
    borderRadius: '8px',
    marginTop: '8px',
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.95)
      : alpha(theme.palette.background.paper, 0.98),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
      : '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledMenuWithRef = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof StyledMenu>>((props, ref) => (
  <StyledMenu {...props} ref={ref} />
));

export function Navigation() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
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
  const [open, setOpen] = useState(false);

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
      handleMobileMenuClose();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderUserMenu = () => (
    <StyledMenuWithRef
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      onClick={handleUserMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
    >
      <StyledMenuItem onClick={() => navigate("/profile")}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profil</ListItemText>
      </StyledMenuItem>
      {isAdmin && (
        <StyledMenuItem onClick={() => navigate("/admin")}>
          <ListItemIcon>
            <AdminIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Administration</ListItemText>
        </StyledMenuItem>
      )}
      <Divider />
      <StyledMenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Déconnexion</ListItemText>
      </StyledMenuItem>
    </StyledMenuWithRef>
  );

  const renderMobileMenu = () => (
    <StyledDrawerWithRef
      anchor="right"
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
    >
      <List>
        {session?.session?.user ? (
          <>
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
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon>
                   <StyledAvatar
                    src={userDetails?.avatar_url || undefined}
                    alt={userDetails?.name || "Avatar"}
                  >
                    {userDetails?.name?.[0] || "U"}
                  </StyledAvatar>
              </ListItemIcon>
              <ListItemText primary={userDetails?.name || "Profil"} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <StyledMenuItem
                onClick={() => {
                  handleMobileMenuClose();
                  navigate("/profile");
                }}
                sx={{ pl: 5 }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profil</ListItemText>
              </StyledMenuItem>
              {isAdmin && (
                <StyledMenuItem onClick={() => {
                }} sx={{ pl: 5 }}>
                  <ListItemIcon>
                    <AdminIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Administration</ListItemText>
                </StyledMenuItem>
              )}
            </Collapse>
            <Divider />
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
    </StyledDrawerWithRef>
  );

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <LogoContainer to="/">
          <Logo src={logo} alt="Logo" />
        </LogoContainer>

        <DesktopNav>
          {session?.session?.user ? (
            <>
              <NavButton
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
              >
                Accueil
              </NavButton>
              <NavButton
                component={Link}
                to="/cake-history"
                startIcon={<HistoryIcon />}
              >
                Historique
              </NavButton>
              <StyledTooltipWithRef title="Profil">
                <IconButton
                  onClick={handleUserMenuOpen}
                  color="inherit"
                  size="large"
                >
                  <StyledAvatar
                    src={userDetails?.avatar_url || undefined}
                    alt={userDetails?.name || "Avatar"}
                  >
                    {userDetails?.name?.[0] || "U"}
                  </StyledAvatar>
                </IconButton>
              </StyledTooltipWithRef>
            </>
          ) : (
            <NavButton
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
            >
              Connexion
            </NavButton>
          )}
          <StyledTooltipWithRef title={mode === "dark" ? "Mode clair" : "Mode sombre"}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'rotate(15deg) scale(1.1)',
                },
              }}
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </StyledTooltipWithRef>
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
