import { useEffect, useState, useCallback } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { supabaseServer } from "@lib/supabase";
import { User, UserRole } from "../../types";
import { useErrorHandler } from "@hooks/useErrorHandler";
import { Link } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const RoleChip = styled(Chip)(() => ({
  fontWeight: "bold",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.main,
    transform: "translateX(4px)",
  },
})) as typeof Box;

interface UserManagerProps {
  isTabActive: boolean;
}

export function UserManager({ isTabActive }: UserManagerProps) {
  const isAdmin = useHasRole("ADMIN");
  const { handleError, handleSuccess } = useErrorHandler();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // État pour le dialogue de modification de rôle
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabaseServer
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      handleError("Erreur lors du chargement des utilisateurs");
      throw err;
    }
  }, [handleError]);

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

    const loadData = async () => {
      if (!isTabActive) return;

      setLoading(true);
      setError(null);

      try {
        await fetchUsers();
      } catch (err) {
        console.error("loadData: error", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin, fetchUsers, isTabActive, handleAdminError]);

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const { error } = await supabaseServer
        .from("users")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Mettre à jour l'utilisateur dans la liste locale
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: selectedRole } : user
        )
      );

      handleSuccess("Rôle mis à jour avec succès");
      handleCloseDialog();
    } catch (err) {
      handleError("Erreur lors de la mise à jour du rôle");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <StyledPaper>
        <Typography variant="h5" component="h2" gutterBottom>
          Gestion des utilisateurs
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Date d'inscription</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        to={`/profile/${user.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <StyledBox>
                          <Avatar
                            src={user.avatar_url}
                            alt={user.name}
                            sx={{ mr: 2, backgroundColor: "primary.main" }}
                          />
                          <Typography variant="body1">{user.name}</Typography>
                        </StyledBox>
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleChip
                        label={user.role}
                        color={user.role === "ADMIN" ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(user)}
                      >
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>

      {/* Dialogue de modification de rôle */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Modifier le rôle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Modifier le rôle de {selectedUser?.name}
          </DialogContentText>
          <Select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="USER">Utilisateur</MenuItem>
            <MenuItem value="ADMIN">Administrateur</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updating}>
            Annuler
          </Button>
          <Button
            onClick={handleRoleChange}
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={24} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
