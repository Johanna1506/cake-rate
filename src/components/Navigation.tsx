import React from "react";
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
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
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
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.primary.main, 0.9),
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease-in-out",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 10px rgba(0, 0, 0, 0.2)"
      : "0 2px 10px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 1),
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
})) as typeof AppBar;

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0, 4),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 1),
  },
})) as typeof Toolbar;

const LogoContainer = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const Logo = styled("img")(({ theme }) => ({
  height: 45,
  marginRight: 12,
  transition: "all 0.3s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    height: 35,
    marginRight: 8,
  },
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
})) as typeof Box;

const NavButton = styled(Button)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.white,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    transform: "translateY(-1px)",
  },
  "& .MuiButton-startIcon": {
    transition: "transform 0.2s ease-in-out",
  },
  "&:hover .MuiButton-startIcon": {
    transform: "scale(1.1)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.875rem",
  },
})) as typeof Button;

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    borderColor: alpha(theme.palette.common.white, 0.4),
  },
})) as typeof Avatar;

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.08),
  },
})) as typeof MenuItem;

const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.grey[800], 0.95)
        : alpha(theme.palette.grey[700], 0.95),
    backdropFilter: "blur(10px)",
    fontSize: "0.875rem",
    padding: "4px 8px",
    borderRadius: "4px",
  },
})) as typeof Tooltip;

const StyledTooltipWithRef = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof StyledTooltip>
>((props, ref) => (
  <StyledTooltip {...props} ref={ref} />
)) as React.ForwardRefExoticComponent<
  React.ComponentProps<typeof StyledTooltip> &
    React.RefAttributes<HTMLDivElement>
>;

const DesktopNav = styled(NavLinks)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
})) as typeof NavLinks;

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    minWidth: "200px",
    borderRadius: "8px",
    marginTop: "8px",
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.95)
        : alpha(theme.palette.background.paper, 0.98),
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.3)"
        : "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
})) as typeof Menu;

const StyledMenuWithRef = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof StyledMenu>
>((props, ref) => (
  <StyledMenu {...props} ref={ref} />
)) as React.ForwardRefExoticComponent<
  React.ComponentProps<typeof StyledMenu> & React.RefAttributes<HTMLDivElement>
>;

const MobileBottomNav = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
  "& .MuiBottomNavigation-root": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.8)
        : alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(10px)",
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px",
    height: "64px",
    padding: "4px 0",
  },
  "& .MuiBottomNavigationAction-root": {
    minWidth: "auto",
    padding: "6px 12px",
    color:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.5)
        : alpha(theme.palette.text.primary, 0.4),
    transition: "all 0.2s ease-in-out",
    "&.Mui-selected": {
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
    },
    "& .MuiBottomNavigationAction-label": {
      fontSize: "0.7rem",
      marginTop: "2px",
      "&.Mui-selected": {
        fontSize: "0.7rem",
        fontWeight: 500,
      },
    },
    "& .MuiSvgIcon-root": {
      fontSize: "24px",
    },
  },
}));

const PageWrapper = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingBottom: 0,
  },
}));

export function Navigation() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { data: userDetails } = useUserDetails(
    session?.session?.user?.id || ""
  );
  const isAdmin = useHasRole("ADMIN");
  const signOut = useSignOut();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [value, setValue] = useState(0);

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/cake-history");
        break;
      case 2:
        handleUserMenuOpen(event as React.MouseEvent<HTMLElement>);
        break;
      default:
        break;
    }
  };

  const renderUserMenu = () => (
    <StyledMenuWithRef
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      onClick={handleUserMenuClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <StyledMenuItem
        onClick={() => navigate(`/profile/${session?.session?.user?.id}`)}
      >
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

  return (
    <>
      <StyledAppBar position="static" role="banner">
        <StyledToolbar>
          <LogoContainer to="/" aria-label="Accueil">
            <Logo src={logo} alt="Logo de l'application" />
          </LogoContainer>

          <DesktopNav role="navigation" aria-label="Navigation principale">
            {session?.session?.user ? (
              <>
                <NavButton
                  component={Link}
                  to="/"
                  startIcon={<HomeIcon />}
                  aria-label="Accéder à la page d'accueil"
                >
                  Accueil
                </NavButton>
                <NavButton
                  component={Link}
                  to="/cake-history"
                  startIcon={<HistoryIcon />}
                  aria-label="Accéder à l'historique des gâteaux"
                >
                  Historique
                </NavButton>
                <StyledTooltipWithRef title="Profil">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    color="inherit"
                    size="large"
                    aria-label="Ouvrir le menu utilisateur"
                    aria-expanded={Boolean(userMenuAnchor)}
                    aria-haspopup="true"
                  >
                    <StyledAvatar
                      src={userDetails?.avatar_url || undefined}
                      alt={`Avatar de ${userDetails?.name || "utilisateur"}`}
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
                aria-label="Se connecter"
              >
                Connexion
              </NavButton>
            )}
            <StyledTooltipWithRef
              title={
                mode === "dark"
                  ? "Passer en mode clair"
                  : "Passer en mode sombre"
              }
            >
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label={
                  mode === "dark"
                    ? "Passer en mode clair"
                    : "Passer en mode sombre"
                }
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "rotate(15deg) scale(1.1)",
                  },
                }}
              >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </StyledTooltipWithRef>
          </DesktopNav>
        </StyledToolbar>
      </StyledAppBar>

      <PageWrapper>
        {session?.session?.user && (
          <MobileBottomNav elevation={0}>
            <BottomNavigation value={value} onChange={handleChange} showLabels>
              <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
              <BottomNavigationAction
                label="Historique"
                icon={<HistoryIcon />}
              />
              <BottomNavigationAction
                label="Profil"
                icon={
                  <StyledAvatar
                    src={userDetails?.avatar_url || undefined}
                    alt={`Avatar de ${userDetails?.name || "utilisateur"}`}
                    sx={{ width: 24, height: 24 }}
                  >
                    {userDetails?.name?.[0] || "U"}
                  </StyledAvatar>
                }
              />
              <BottomNavigationAction
                label={mode === "dark" ? "Clair" : "Sombre"}
                icon={mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                onClick={toggleTheme}
              />
            </BottomNavigation>
          </MobileBottomNav>
        )}
      </PageWrapper>

      {renderUserMenu()}
    </>
  );
}
