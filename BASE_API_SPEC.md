# Backend API Specification

## RESTful API Endpoints

### Authentication & Authorization

```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/refresh
```

### Patient Management

```
GET    /api/patients/profile
PUT    /api/patients/profile
GET    /api/patients/sessions
```

### Exercise Sessions

```
POST   /api/sessions                    # Create new session
GET    /api/sessions                    # List sessions
GET    /api/sessions/{session_id}       # Get session details
PUT    /api/sessions/{session_id}       # Update session metadata
DELETE /api/sessions/{session_id}       # Delete session
```

### Video & Data Upload

```
POST   /api/upload/generate-url         # Get signed upload URLs
POST   /api/sessions/{session_id}/data  # Upload pose metadata
```

### Physiotherapist Operations

```
GET    /api/physio/patients             # List assigned patients
GET    /api/physio/sessions             # Sessions needing review
POST   /api/physio/reviews              # Submit session review
GET    /api/physio/analytics            # Patient progress data
```

## Detailed Endpoint Specifications

### 1. Create Exercise Session

**POST** `/api/sessions`

**Request Body:**
```json
{
  "patient_id": "uuid-string",
  "exercise_type": "squat",
  "scheduled_datetime": "2026-01-30T10:00:00Z",
  "estimated_duration": 60,
  "instructions": "Perform 10 squats with proper form"
}
```

**Response (201 Created):**
```json
{
  "session_id": "uuid-string",
  "status": "created",
  "upload_urls": {
    "video": "https://storage.googleapis.com/signed-upload-url",
    "metadata": "https://api.example.com/api/sessions/uuid-string/data"
  },
  "expires_at": "2026-01-30T11:00:00Z"
}
```

### 2. Upload Pose Metadata

**POST** `/api/sessions/{session_id}/data`

**Request Body:**
```json
{
  "frames": [
    {
      "timestamp": 1706630400000,
      "landmarks": [
        {
          "type": "LEFT_SHOULDER",
          "x": 0.45,
          "y": 0.32,
          "z": 0.1,
          "visibility": 0.98
        }
      ],
      "angles": {
        "elbow_left": 145.2,
        "elbow_right": 178.1,
        "knee_left": 92.3,
        "knee_right": 89.7
      },
      "quality_score": 0.92,
      "form_issues": [
        {
          "type": "ANGLE_WARNING",
          "joint": "knee_left",
          "message": "Left knee angle below target range",
          "severity": "MEDIUM"
        }
      ]
    }
  ],
  "summary_statistics": {
    "total_frames": 450,
    "average_quality": 0.89,
    "peak_angles": {
      "knee_left_max": 125.4,
      "knee_right_max": 123.1
    }
  }
}
```

### 3. Get Session Details (Physio View)

**GET** `/api/sessions/{session_id}`

**Response:**
```json
{
  "session": {
    "id": "uuid-string",
    "patient_id": "patient-123",
    "patient_name": "John Doe",
    "exercise_type": "squat",
    "start_time": "2026-01-30T10:00:00Z",
    "end_time": "2026-01-30T10:01:00Z",
    "duration_seconds": 60,
    "status": "reviewed",
    "video_url": "https://storage.googleapis.com/session-videos/video.mp4",
    "created_at": "2026-01-30T09:30:00Z"
  },
  "pose_data": {
    "frame_count": 450,
    "sampling_rate": 15,
    "angle_ranges": {
      "knee_left": {"min": 85.2, "max": 125.4, "avg": 105.3},
      "knee_right": {"min": 83.1, "max": 123.1, "avg": 103.2}
    }
  },
  "review": {
    "physiotherapist_id": "physio-456",
    "physiotherapist_name": "Dr. Smith",
    "notes": "Good form overall. Left knee tracking slightly outside foot placement.",
    "overall_assessment": "GOOD",
    "form_feedback": [
      {
        "timestamp": 1706630415000,
        "issue": "Knee valgus observed at bottom position",
        "recommendation": "Focus on pushing knees outward during descent"
      }
    ],
    "reviewed_at": "2026-01-30T11:30:00Z"
  }
}
```

### 4. Submit Physio Review

**POST** `/api/physio/reviews`

**Request Body:**
```json
{
  "session_id": "uuid-string",
  "notes": "Patient demonstrated good technique with minor adjustments needed...",
  "overall_assessment": "FAIR",
  "form_feedback": [
    {
      "timestamp": 1706630415000,
      "issue": "Excessive forward lean",
      "recommendation": "Engage core and maintain upright torso",
      "severity": "MEDIUM"
    }
  ],
  "next_steps": {
    "recommended_exercises": ["glute_bridge", "wall_sit"],
    "frequency": "3 times per week",
    "follow_up_date": "2026-02-06T10:00:00Z"
  }
}
```

## Database Migration Scripts

### PostgreSQL Schema

```sql
-- 01_create_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'physiotherapist', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    medical_conditions TEXT[],
    medications TEXT[],
    emergency_contact JSONB,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physiotherapists table
CREATE TABLE physiotherapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    years_experience INTEGER,
    clinic_affiliation VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient-Physio assignments
CREATE TABLE patient_physio_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    physiotherapist_id UUID REFERENCES physiotherapists(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE(patient_id, physiotherapist_id)
);

-- Exercise types reference
CREATE TABLE exercise_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    target_muscles TEXT[],
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise sessions
CREATE TABLE exercise_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    physiotherapist_id UUID REFERENCES physiotherapists(id),
    exercise_type_id UUID REFERENCES exercise_types(id),
    scheduled_datetime TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    video_storage_key VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'recording', 'processing', 'review_pending', 'reviewed', 'completed')),
    instructions TEXT,
    equipment_used TEXT[],
    environment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pose frames (time-series data)
CREATE TABLE pose_frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
    frame_number INTEGER,
    timestamp_ms BIGINT NOT NULL,
    landmarks JSONB NOT NULL,
    calculated_angles JSONB,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    form_issues JSONB,
    processing_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session reviews
CREATE TABLE session_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
    physiotherapist_id UUID REFERENCES physiotherapists(id),
    notes TEXT,
    overall_assessment VARCHAR(20) CHECK (overall_assessment IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    form_feedback JSONB,
    recommendations JSONB,
    next_session_scheduled TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access logs for audit trail
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_exercise_sessions_patient_time ON exercise_sessions(patient_id, start_time DESC);
CREATE INDEX idx_exercise_sessions_status ON exercise_sessions(status);
CREATE INDEX idx_pose_frames_session_timestamp ON pose_frames(session_id, timestamp_ms);
CREATE INDEX idx_session_reviews_session ON session_reviews(session_id);
CREATE INDEX idx_access_logs_user_timestamp ON access_logs(user_id, timestamp DESC);

-- Create audit triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_sessions_updated_at BEFORE UPDATE ON exercise_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_reviews_updated_at BEFORE UPDATE ON session_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Configuration

### .env.example
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/physalign
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Storage Configuration
STORAGE_PROVIDER=gcp  # or aws
STORAGE_BUCKET_NAME=physalign-videos
STORAGE_REGION=us-central1

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION_HOURS=24
REFRESH_TOKEN_EXPIRATION_DAYS=30

# API Configuration
API_PORT=3000
API_BASE_URL=https://api.physalign.com
CORS_ORIGINS=["https://app.physalign.com", "https://dashboard.physalign.com"]

# Security
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=32-byte-encryption-key-for-sensitive-data

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
AUDIT_LOG_ENABLED=true

# Third-party Services
SENDGRID_API_KEY=your-sendgrid-api-key
SENTRY_DSN=your-sentry-dsn
```

## API Response Standards

### Success Responses
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-01-30T10:00:00Z",
    "request_id": "uuid-string"
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data provided",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-30T10:00:00Z",
    "request_id": "uuid-string"
  }
}
```

### Pagination Standard
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 142,
    "total_pages": 8
  }
}
```

This backend specification provides a production-ready foundation with proper security, audit trails, and scalable architecture patterns.