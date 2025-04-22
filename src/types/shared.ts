export interface User {
  id: string;
  name: string;
  avatar_url: string;
}

export interface Season {
  id: string;
  theme: string;
  is_active: boolean;
  created_at: string;
  participant_count: number;
}

export interface Week {
  id: string;
  season_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description: string;
  show_scores: boolean;
  created_at: string;
  season: Season;
}

export interface Cake {
  id: string;
  user_id: string;
  week_id: string;
  image_url: string;
  description: string;
  created_at: string;
  week: Week;
  user: User;
}