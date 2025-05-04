export interface User {
  id: string;
  name: string;
}

export interface Week {
  id?: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: string | null;
  is_active: boolean;
}

export interface WeekFormData {
  description: string;
  startDate: Date;
  endDate: Date;
  userId: string | null;
  isActive: boolean;
  errors?: {
    description?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  };
}

export interface Season {
  id: string;
  theme: string;
  participant_count: number;
  is_active: boolean;
  weeks?: Week[];
}
