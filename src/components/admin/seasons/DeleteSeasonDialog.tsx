import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { DeleteSeasonDialogProps } from "./types";

export function DeleteSeasonDialog({
  open,
  season,
  onClose,
  onConfirm,
}: DeleteSeasonDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Supprimer la saison?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Êtes-vous sûr de vouloir supprimer cette saison? Cette action est
          irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
