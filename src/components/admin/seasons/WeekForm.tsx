import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Tooltip,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { fr } from "date-fns/locale";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { WeekFormProps } from "./types";

export function WeekForm({
  week,
  index,
  users,
  onWeekChange,
  onRemoveWeek,
  canRemove,
  errors,
}: WeekFormProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 1,
        mb: 1,
        [theme.breakpoints.up("sm")]: { p: 2, mb: 2 },
      }}
    >
      <Stack spacing={2} sx={{ [theme.breakpoints.up("sm")]: { spacing: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1">Semaine {index + 1}</Typography>
          {canRemove && (
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemoveWeek(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={week.description}
          onChange={(e) => onWeekChange(index, "description", e.target.value)}
          error={!!errors?.description}
          helperText={errors?.description}
          size="small"
          sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              [theme.breakpoints.up("sm")]: { gap: 2 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <DatePicker
                label="Date de début"
                value={week.startDate}
                onChange={(date) => onWeekChange(index, "startDate", date)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!errors?.startDate,
                    helperText: errors?.startDate,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Tooltip
                title={`La date de fin doit être postérieure au ${week.startDate.toLocaleDateString(
                  "fr-FR"
                )}`}
              >
                <DatePicker
                  label="Date de fin"
                  value={week.endDate}
                  onChange={(date) => onWeekChange(index, "endDate", date)}
                  format="dd/MM/yyyy"
                  minDate={week.startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors?.endDate,
                      helperText:
                        errors?.endDate ||
                        `Après le ${week.startDate.toLocaleDateString(
                          "fr-FR"
                        )}`,
                    },
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
        </LocalizationProvider>

        <FormControl
          fullWidth
          size="small"
          error={!!errors?.userId}
          sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
        >
          <InputLabel id={`user-select-label-${index}`}>Participant</InputLabel>
          <Select
            labelId={`user-select-label-${index}`}
            value={week.userId || ""}
            onChange={(e) => onWeekChange(index, "userId", e.target.value)}
            label="Participant"
            size="small"
            sx={{ [theme.breakpoints.up("sm")]: { size: "medium" } }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
