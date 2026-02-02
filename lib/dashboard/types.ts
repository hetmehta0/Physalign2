export type Exercise = {
  id?: number;
  name: string;
  sets: number;
  reps: number;
  notes: string;
  lastModified?: string;
};

export type Program = {
  id: string;
  physio_id: string;
  access_code: string;
  patient_name: string | null;
  exercises: Exercise[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_accessed: string | null;
  expires_at: string | null;
};

export type Session = {
  id: string;
  program_id: string;
  access_code: string;
  exercise_name: string;
  rep_count: number;
  target_reps: number;
  completion_percentage: number;
  average_rom: number | null;
  max_rom: number | null;
  stress_score: number | null;
  video_url: string | null;
  notes: string | null;
  metrics: any;
  completed_at: string;
};
