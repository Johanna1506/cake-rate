import type { Season, User, WeekFormData } from "../../../types";

export interface SeasonListProps {
  seasons: Season[];
  loading?: boolean;
  error?: string | null;
  onAddSeason: () => void;
  onEditSeason: (season: Season) => void;
  onDeleteSeason: (season: Season) => void;
  onCloseSeason: (season: Season) => void;
}

export interface WeekFormProps {
  week: WeekFormData;
  index: number;
  users: User[];
  onWeekChange: (
    index: number,
    field: keyof WeekFormData,
    value: string | Date | null
  ) => void;
  onRemoveWeek: (index: number) => void;
  canRemove: boolean;
  errors?: WeekFormData["errors"];
}

export interface SeasonFormProps {
  open: boolean;
  isEditing: boolean;
  season?: Season | null;
  seasonTheme: string;
  participantCount: number;
  isActive: boolean;
  weeks: WeekFormData[];
  users: User[];
  formErrors: {
    theme?: string;
    participantCount?: string;
    weeks?: Array<{ errors?: WeekFormData["errors"] }>;
  };
  onClose: () => void;
  onSubmit: () => void;
  onThemeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onParticipantCountChange: (count: number) => void;
  onActiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWeekChange: (
    index: number,
    field: keyof WeekFormData,
    value: string | Date | null
  ) => void;
  onAddWeek: () => void;
  onRemoveWeek: (index: number) => void;
}

export interface DeleteSeasonDialogProps {
  open: boolean;
  season?: Season | null;
  onClose: () => void;
  onConfirm: () => void;
}
