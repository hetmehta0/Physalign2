-- Create exercise_programs table to store exercise programs
CREATE TABLE IF NOT EXISTS exercise_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    physio_id UUID NOT NULL,
    access_code TEXT UNIQUE NOT NULL,
    patient_name TEXT,
    exercises JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_sessions table to store tracking data
CREATE TABLE IF NOT EXISTS exercise_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES exercise_programs(id) ON DELETE CASCADE,
    access_code TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    rep_count INTEGER NOT NULL,
    target_reps INTEGER NOT NULL,
    completion_percentage DECIMAL(5,2),
    average_rom DECIMAL(6,2),
    max_rom DECIMAL(6,2),
    stress_score DECIMAL(5,2),
    video_url TEXT,
    notes TEXT,
    metrics JSONB,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sessions_program_id ON exercise_sessions(program_id);
CREATE INDEX idx_sessions_access_code ON exercise_sessions(access_code);
CREATE INDEX idx_sessions_completed_at ON exercise_sessions(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Physios can view sessions for their programs
CREATE POLICY "Physios can view their program sessions"
    ON exercise_sessions
    FOR SELECT
    USING (
        program_id IN (
            SELECT id FROM exercise_programs
            WHERE physio_id = auth.uid()
        )
    );

-- Policy: Anyone with access code can insert sessions (for patient tracking app)
CREATE POLICY "Anyone with access code can create sessions"
    ON exercise_sessions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM exercise_programs
            WHERE access_code = exercise_sessions.access_code
            AND id = exercise_sessions.program_id
        )
    );

-- Add comment
COMMENT ON TABLE exercise_sessions IS 'Stores completed exercise sessions from tracking system';

-- Ensure access_code index on programs table
CREATE INDEX IF NOT EXISTS idx_programs_access_code ON exercise_programs(access_code);

-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-videos', 'exercise-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow anyone to upload videos (patients)
CREATE POLICY "Allow public uploads to exercise-videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-videos');

-- Storage policy: Allow physios to view videos from their programs
CREATE POLICY "Physios can view exercise videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exercise-videos' AND
  (storage.foldername(name))[1] IN (
    SELECT access_code FROM exercise_programs
    WHERE physio_id = auth.uid()
  )
);
