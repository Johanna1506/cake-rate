import { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { WeekForm } from "./WeekForm";
import type { SeasonFormProps } from "./types";

export function SeasonForm({
  open,
  isEditing,
  season,
  seasonTheme,
  participantCount,
  isActive,
  weeks,
  users,
  formErrors,
  onClose,
  onSubmit,
  onThemeChange,
  onParticipantCountChange,
  onActiveChange,
  onWeekChange,
  onAddWeek,
  onRemoveWeek,
}: SeasonFormProps) {
  const theme = useTheme();
  const themeInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600}
    >
      <DialogTitle>
        {isEditing ? "Modifier la saison" : "Ajouter une saison"}
      </DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          sx={{ mt: 1, [theme.breakpoints.up("sm")]: { spacing: 3 } }}
        >
          <TextField
            label="Thème"
            fullWidth
            value={seasonTheme}
            onChange={onThemeChange}
            helperText={formErrors.theme}
            error={!!formErrors.theme}
            required
            size="small"
            inputRef={themeInputRef}
            sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
          />

          <TextField
            label="Nombre de participants"
            type="number"
            fullWidth
            value={participantCount}
            onChange={(e) => onParticipantCountChange(parseInt(e.target.value))}
            inputProps={{ min: 1 }}
            helperText={formErrors.participantCount}
            error={!!formErrors.participantCount}
            required
            size="small"
            sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={onActiveChange}
                color="primary"
                size="small"
                sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
              />
            }
            label="Saison active"
          />

          {!isEditing && (
            <>
              <Typography
                variant="h6"
                sx={{ mt: 1, [theme.breakpoints.up("sm")]: { mt: 2 } }}
              >
                Semaines
              </Typography>
              {weeks.map((week, index) => (
                <WeekForm
                  key={index}
                  week={week}
                  index={index}
                  users={users}
                  onWeekChange={onWeekChange}
                  onRemoveWeek={onRemoveWeek}
                  canRemove={weeks.length > 1}
                  errors={formErrors.weeks?.[index]?.errors}
                />
              ))}
              {weeks.length < participantCount && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={onAddWeek}
                  variant="outlined"
                  size="small"
                  sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
                >
                  Ajouter une semaine
                </Button>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={onSubmit} color="primary" autoFocus>
          {isEditing ? "Modifier" : "Ajouter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
