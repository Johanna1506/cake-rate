import { useEffect, useState, useCallback } from "react";
import { useHasRole } from "@hooks/useAuthQuery";
import { supabase, supabaseServer } from "@lib/supabase";
import { User, UserRole } from "../../types";
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

export function UserManager() {
  const isAdmin = useHasRole("ADMIN");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // État pour le dialogue de modification de rôle
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");

  const fetchUsers = useCallback(async () => {
    console.log("fetchUsers: start");
    try {
      console.log("fetchUsers: before supabase call");
      const { data, error } = await supabaseServer
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("fetchUsers: after supabase call", { data, error });
      if (error) {
        console.error("fetchUsers: supabase error", error);
        throw error;
      }
      console.log("fetchUsers: setting data", data);
      setUsers(data || []);
      return data;
    } catch (err) {
      console.error("fetchUsers: catch error", err);
      setError("Erreur lors du chargement des utilisateurs");
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setError(
        "Vous n'avez pas les permissions nécessaires pour accéder à cette page"
      );
      setLoading(false);
      return;
    }

    const loadData = async () => {
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
  }, [isAdmin, fetchUsers]);

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

      handleCloseDialog();
    } catch (err) {
      setError("Erreur lors de la mise à jour du rôle");
      console.error(err);
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
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={user.avatar_url}
                          alt={user.name}
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="body1">{user.name}</Typography>
                      </Box>
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
            Modifiez le rôle de {selectedUser?.name}
          </DialogContentText>
          <Select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="USER">USER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleRoleChange}
            variant="contained"
            color="primary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
