import cv2 as cv
import mediapipe as mp
import numpy as np
import time
from collections import deque
import subprocess
import threading

# ============================================
# VOICE FEEDBACK SYSTEM
# ============================================

class VoiceFeedback:
    def __init__(self):
        self.last_spoken = ""
        self.last_spoken_time = 0
        self.cooldown = 2  # Seconds between feedback
    
    def speak(self, text):
        """Speak using Mac's built-in 'say' command"""
        current_time = time.time()
        
        if current_time - self.last_spoken_time < self.cooldown:
            return
        
        self.last_spoken = text
        self.last_spoken_time = current_time
        
        voice = "Samantha"
        def _speak():
            subprocess.Popen(['say', '-v', voice, text],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        thread = threading.Thread(target=_speak)
        thread.daemon = True
        thread.start()

# ============================================
# EXERCISE LIBRARY
# ============================================

EXERCISE_LIBRARY = {
    "squat": {
        "name": "Squats",
        "camera_angle": "side",
        "tracking_mode": "single_side",
        "primary_joints": ["left_knee", "left_hip"],
        "analysis_function": "analyze_squat_side",
        "reps_target": 10,
        "record_video": True
    },
    "squat_front": {
        "name": "Squats (Front View)",
        "camera_angle": "front",
        "tracking_mode": "bilateral_with_depth",
        "primary_joints": ["left_knee", "right_knee", "left_hip", "right_hip"],
        "analysis_function": "analyze_squat_front_depth",
        "reps_target": 10,
        "record_video": True
    },
    "shoulder_raise": {
        "name": "Shoulder Raises",
        "camera_angle": "front",
        "tracking_mode": "bilateral",
        "primary_joints": ["left_shoulder", "right_shoulder"],
        "analysis_function": "analyze_shoulder_front",
        "reps_target": 15,
        "record_video": False
    }
}

# ============================================
# FACE STRESS TRACKING
# ============================================

def track_face_stress_simple(frame):
    """Simple face stress tracking - returns stress score 0-100"""
    mp_face_mesh = mp.solutions.face_mesh
    
    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as face_mesh:
        
        h, w, _ = frame.shape
        rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)
        
        if results.multi_face_landmarks:
            face = results.multi_face_landmarks[0]
            lm = [(int(p.x * w), int(p.y * h)) for p in face.landmark]
            
            LEFT_EYE_TOP = 159
            LEFT_EYE_BOTTOM = 145
            LEFT_BROW = 70
            MOUTH_LEFT = 61
            MOUTH_RIGHT = 291
            
            eye_h = np.linalg.norm(np.array(lm[LEFT_EYE_TOP]) - np.array(lm[LEFT_EYE_BOTTOM]))
            brow_y = lm[LEFT_BROW][1]
            eye_y = lm[LEFT_EYE_TOP][1]
            brow_raise = max(0, eye_y - brow_y)
            mouth_width = np.linalg.norm(np.array(lm[MOUTH_LEFT]) - np.array(lm[MOUTH_RIGHT]))
            
            stress_score = min(100, (brow_raise / 15) * 50 + (100 - eye_h) * 0.5)
            
            return max(0, stress_score)
        
        return 0

# ============================================
# BODY TRACKING
# ============================================

def track_body_stress(frame, baseline=None, stress_history=None, calibrating=False, calib_start=None, prev_angles=None):
    """Track body joints and calculate angles"""
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    def angle_between_points(a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
        return np.degrees(angle)

    JOINTS = {
        "left_elbow": [11, 13, 15],
        "right_elbow": [12, 14, 16],
        "left_shoulder": [23, 11, 13],
        "right_shoulder": [24, 12, 14],
        "left_knee": [23, 25, 27],
        "right_knee": [24, 26, 28],
        "left_hip": [11, 23, 25],
        "right_hip": [12, 24, 26]
    }

    stress_history = stress_history or {k: deque(maxlen=10) for k in JOINTS.keys()}
    baseline = baseline or {}
    smoothed_stress = {}
    current_angles = {}
    calib_start = calib_start or time.time()
    prev_angles = prev_angles or {}

    h, w, _ = frame.shape
    rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
    results = pose.process(rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        coords = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]

        joint_angles = {}
        alpha = 0.6

        for joint, points in JOINTS.items():
            a, b, c = [coords[i] for i in points]
            angle = angle_between_points(a, b, c)

            prev = prev_angles.get(joint, angle)
            smooth_angle = alpha * angle + (1 - alpha) * prev
            prev_angles[joint] = smooth_angle
            joint_angles[joint] = smooth_angle

            if calibrating:
                if joint not in baseline:
                    baseline[joint] = []
                baseline[joint].append(smooth_angle)

        if calibrating and time.time() - calib_start > 3:
            baseline = {k: np.mean(v) for k, v in baseline.items()}
            calibrating = False
            print("✅ Calibration complete!")

        if not calibrating:
            for joint, angle in joint_angles.items():
                deviation = abs(angle - baseline[joint]) / baseline[joint]
                stress_history[joint].append(deviation * 100)
                smoothed_stress[joint] = np.mean(stress_history[joint])
                current_angles[joint] = angle

                if smoothed_stress[joint] > 30:
                    color = (0, 0, 255)
                elif smoothed_stress[joint] > 15:
                    color = (0, 165, 255)
                else:
                    color = (0, 255, 0)

                cv.circle(frame, coords[JOINTS[joint][1]], 12, color, -1)
                
                joint_depth = landmarks[JOINTS[joint][1]].z
                current_angles[f"{joint}_depth"] = joint_depth
        
        mp.solutions.drawing_utils.draw_landmarks(
            frame, 
            results.pose_landmarks, 
            mp_pose.POSE_CONNECTIONS,
            mp.solutions.drawing_utils.DrawingSpec(color=(0,255,0), thickness=2, circle_radius=2),
            mp.solutions.drawing_utils.DrawingSpec(color=(255,255,255), thickness=2, circle_radius=2)
        )

    if calibrating:
        cv.putText(frame, "Calibrating...", (30, 80),
                   cv.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)

    return frame, baseline, stress_history, smoothed_stress, current_angles, calibrating, calib_start, prev_angles


# ============================================
# IMPROVED UI OVERLAY
# ============================================

def draw_modern_ui(frame, exercise_name, rep_count, target_reps, quality, feedback_text, 
                   stress_level, tiredness_level, tempo_feedback):
    """Draw modern, clean UI overlay with white transparent panels"""
    h, w = frame.shape[:2]
    
    # WHITE TRANSPARENT BACKGROUND overlay (full frame)
    overlay_bg = frame.copy()
    cv.rectangle(overlay_bg, (0, 0), (w, h), (255, 255, 255), -1)
    cv.addWeighted(overlay_bg, 0.15, frame, 0.85, 0, frame)
    
    # LEFT PANEL (200px wide) - White transparent
    left_panel = frame.copy()
    cv.rectangle(left_panel, (0, 0), (200, h), (255, 255, 255), -1)
    cv.addWeighted(left_panel, 0.25, frame, 0.75, 0, frame)
    
    # LEFT PANEL ACCENT LINE
    cv.line(frame, (198, 0), (198, h), (0, 212, 255), 3)
    
    # LEFT: Exercise name
    cv.putText(frame, exercise_name.upper(), (100, 50),
               cv.FONT_HERSHEY_SIMPLEX, 0.7, (26, 26, 26), 2, cv.LINE_AA)
    cv.putText(frame, exercise_name.upper(), (100, 50),
               cv.FONT_HERSHEY_SIMPLEX, 0.7, (26, 26, 26), 2, cv.LINE_AA)
    cv.line(frame, (20, 60), (180, 60), (80, 80, 80), 1)
    
    # LEFT: REPS section
    cv.putText(frame, "REPS", (100, 140),
               cv.FONT_HERSHEY_SIMPLEX, 0.5, (102, 102, 102), 1, cv.LINE_AA)
    rep_text = f"{rep_count}/{target_reps}"
    cv.putText(frame, rep_text, (100, 210),
               cv.FONT_HERSHEY_SIMPLEX, 2.2, (26, 26, 26), 3, cv.LINE_AA)
    
    # Reps progress bar
    progress = min(1.0, rep_count / target_reps)
    cv.rectangle(frame, (25, 230), (175, 248), (224, 224, 224), -1)
    fill_w = int(150 * progress)
    cv.rectangle(frame, (25, 230), (25 + fill_w, 248), (136, 255, 0), -1)
    cv.rectangle(frame, (25, 230), (175, 248), (26, 26, 26), 2)
    
    cv.line(frame, (20, 280), (180, 280), (80, 80, 80), 1)
    
    # LEFT: FORM section
    cv.putText(frame, "FORM", (100, 320),
               cv.FONT_HERSHEY_SIMPLEX, 0.5, (102, 102, 102), 1, cv.LINE_AA)
    quality_color = (136, 255, 0) if quality > 70 else (0, 204, 255) if quality > 40 else (68, 68, 255)
    cv.putText(frame, f"{int(quality)}%", (100, 380),
               cv.FONT_HERSHEY_SIMPLEX, 1.8, quality_color, 3, cv.LINE_AA)
    
    # Form quality bar
    # TODO: Ensure it changes color based on quality and updates 
    cv.rectangle(frame, (25, 400), (175, 416), (224, 224, 224), -1)
    q_fill = int(150 * (quality / 100))
    cv.rectangle(frame, (25, 400), (25 + q_fill, 416), quality_color, -1)
    cv.rectangle(frame, (25, 400), (175, 416), (26, 26, 26), 2)
    
    cv.line(frame, (20, 450), (180, 450), (80, 80, 80), 1)
    
    # LEFT: FEEDBACK section
    cv.putText(frame, "FEEDBACK", (100, 490),
               cv.FONT_HERSHEY_SIMPLEX, 0.5, (102, 102, 102), 1, cv.LINE_AA)
    
    # Split feedback text into lines
    feedback_words = feedback_text.split()
    if len(feedback_words) > 2:
        line1 = " ".join(feedback_words[:2])
        line2 = " ".join(feedback_words[2:])
        cv.putText(frame, line1, (100, 540),
                   cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 170, 102), 2, cv.LINE_AA)
        cv.putText(frame, line2, (100, 575),
                   cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 170, 102), 2, cv.LINE_AA)
    else:
        cv.putText(frame, feedback_text, (100, 540),
                   cv.FONT_HERSHEY_SIMPLEX, 0.7, (0, 170, 102), 2, cv.LINE_AA)
    
    cv.putText(frame, tempo_feedback, (100, 620),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 153, 204), 2, cv.LINE_AA)
    
    # RIGHT PANEL (200px wide) - White transparent
    right_panel = frame.copy()
    cv.rectangle(right_panel, (w - 200, 0), (w, h), (255, 255, 255), -1)
    cv.addWeighted(right_panel, 0.25, frame, 0.75, 0, frame)
    
    # RIGHT PANEL ACCENT LINE
    cv.line(frame, (w - 198, 0), (w - 198, h), (0, 212, 255), 3)
    
    # RIGHT: Header
    cv.putText(frame, "METRICS", (w - 100, 50),
               cv.FONT_HERSHEY_SIMPLEX, 0.7, (26, 26, 26), 2, cv.LINE_AA)
    cv.line(frame, (w - 180, 60), (w - 20, 60), (80, 80, 80), 1)
    
    # RIGHT: FATIGUE section
    cv.putText(frame, "FATIGUE", (w - 100, 140),
               cv.FONT_HERSHEY_SIMPLEX, 0.5, (102, 102, 102), 1, cv.LINE_AA)
    tired_color = (136, 255, 0) if tiredness_level < 30 else (0, 204, 255) if tiredness_level < 60 else (68, 136, 255)
    cv.putText(frame, f"{int(tiredness_level)}%", (w - 100, 195),
               cv.FONT_HERSHEY_SIMPLEX, 1.6, tired_color, 3, cv.LINE_AA)
    
    # Fatigue bar
    cv.rectangle(frame, (w - 175, 210), (w - 25, 226), (224, 224, 224), -1)
    t_fill = int(150 * (tiredness_level / 100))
    cv.rectangle(frame, (w - 175, 210), (w - 175 + t_fill, 226), tired_color, -1)
    cv.rectangle(frame, (w - 175, 210), (w - 25, 226), (26, 26, 26), 1)
    
    cv.line(frame, (w - 180, 250), (w - 20, 250), (80, 80, 80), 1)
    
    # RIGHT: MOOD SCALE section
    cv.putText(frame, "MOOD", (w - 100, 300),
               cv.FONT_HERSHEY_SIMPLEX, 0.5, (102, 102, 102), 1, cv.LINE_AA)
    
    # Vertical mood gradient bar
    mood_x = w - 125
    mood_y = 330
    mood_h = 250
    mood_w = 50
    
    # Draw gradient (red -> yellow -> green from bottom to top)
    for i in range(mood_h):
        ratio = i / mood_h
        if ratio < 0.5:
            # Red to Yellow (bottom half)
            r = 255
            g = int(255 * (ratio * 2))
            b = 68
        else:
            # Yellow to Green (top half)
            r = int(255 * (2 - ratio * 2))
            g = 255
            b = int(136 * (ratio - 0.5) * 2)
        
        cv.rectangle(frame, (mood_x, mood_y + mood_h - i), 
                    (mood_x + mood_w, mood_y + mood_h - i + 2), (b, g, r), -1)
    
    # Mood indicator circle (based on tiredness - inverted so low tiredness = happy)
    mood_position = (100 - tiredness_level) / 100  # Invert so low fatigue = high mood
    indicator_y = int(mood_y + mood_h - (mood_h * mood_position))
    indicator_color = (136, 255, 0) if mood_position > 0.6 else (0, 204, 255) if mood_position > 0.3 else (68, 68, 255)
    cv.circle(frame, (mood_x + mood_w // 2, indicator_y), 18, indicator_color, -1)
    cv.circle(frame, (mood_x + mood_w // 2, indicator_y), 18, (26, 26, 26), 3)
    
    # Mood bar border
    cv.rectangle(frame, (mood_x, mood_y), (mood_x + mood_w, mood_y + mood_h), (26, 26, 26), 2)
    
    # Emoji indicators
    cv.putText(frame, "😊", (w - 50, 375),
               cv.FONT_HERSHEY_SIMPLEX, 1.2, (26, 26, 26), 2, cv.LINE_AA)
    cv.putText(frame, "😐", (w - 50, 475),
               cv.FONT_HERSHEY_SIMPLEX, 1.2, (26, 26, 26), 2, cv.LINE_AA)
    cv.putText(frame, "😫", (w - 50, 570),
               cv.FONT_HERSHEY_SIMPLEX, 1.2, (26, 26, 26), 2, cv.LINE_AA)
    
    # Mood status text
    if mood_position > 0.6:
        mood_text = "Feeling Good"
        mood_text_color = (0, 170, 102)
    elif mood_position > 0.3:
        mood_text = "Moderate"
        mood_text_color = (0, 153, 204)
    else:
        mood_text = "Tired"
        mood_text_color = (68, 68, 255)
    
    cv.putText(frame, mood_text, (w - 100, 620),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, mood_text_color, 2, cv.LINE_AA)
    
    # BOTTOM BRANDING
    cv.putText(frame, "PHYSALIGN", (100, h - 60),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 163, 204), 2, cv.LINE_AA)
    cv.putText(frame, "AI-Powered PT", (100, h - 35),
               cv.FONT_HERSHEY_SIMPLEX, 0.3, (102, 102, 102), 1, cv.LINE_AA)
    
    cv.putText(frame, "PHYSALIGN", (w - 100, h - 60),
               cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 163, 204), 2, cv.LINE_AA)
    cv.putText(frame, "AI-Powered PT", (w - 100, h - 35),
               cv.FONT_HERSHEY_SIMPLEX, 0.3, (102, 102, 102), 1, cv.LINE_AA)
    
    # Corner accents
    cv.line(frame, (0, 0), (40, 0), (0, 163, 204), 3)
    cv.line(frame, (0, 0), (0, 40), (0, 163, 204), 3)
    cv.line(frame, (w - 40, 0), (w, 0), (0, 163, 204), 3)
    cv.line(frame, (w, 0), (w, 40), (0, 163, 204), 3)
    cv.line(frame, (0, h), (40, h), (0, 163, 204), 3)
    cv.line(frame, (0, h - 40), (0, h), (0, 163, 204), 3)
    cv.line(frame, (w - 40, h), (w, h), (0, 163, 204), 3)
    cv.line(frame, (w, h - 40), (w, h), (0, 163, 204), 3)
    
    return frame


# ============================================
# FEEDBACK ENGINE (FIXED REP COUNTING)
# ============================================

class ExerciseFeedback:
    def __init__(self, exercise_config):
        self.config = exercise_config
        self.rep_count = 0
        self.last_rep_time = time.time()
        self.exercise_start_time = None
        self.rep_quality_scores = []
        self.rep_history = deque(maxlen=60)
        self.in_bottom_position = False
        
        # Velocity tracking
        self.depth_history = deque(maxlen=10)
        self.velocity_history = []
        self.last_depth = None
        self.last_time = None
        
        # Tiredness tracking
        self.tiredness_level = 0
        self.rep_times = []
    
    def calculate_velocity(self, current_depth):
        """Calculate movement speed"""
        current_time = time.time()
        
        if self.last_depth is None or self.last_time is None:
            self.last_depth = current_depth
            self.last_time = current_time
            return 0
        
        depth_change = abs(current_depth - self.last_depth)
        time_change = current_time - self.last_time
        
        velocity = depth_change / time_change if time_change > 0 else 0
        
        self.last_depth = current_depth
        self.last_time = current_time
        
        return velocity
    
    def update_tiredness(self):
        """Calculate tiredness based on rep count and time"""
        if self.rep_count == 0:
            return 0
        
        # Fatigue increases with reps
        rep_factor = (self.rep_count / self.config["reps_target"]) * 60
        
        # If reps are slowing down, increase fatigue
        if len(self.rep_times) >= 3:
            recent_times = list(self.rep_times)[-3:]
            if recent_times[-1] > recent_times[0] * 1.3:
                rep_factor += 20
        
        self.tiredness_level = min(100, rep_factor)
        return self.tiredness_level
    
    def analyze_squat_side(self, joint_angles):
        """Squat from side - FIXED THRESHOLDS"""
        quality_score = 100
        
        knee_angle = joint_angles.get("left_knee", 180)
        hip_angle = joint_angles.get("left_hip", 180)
        
        if knee_angle > 120:
            quality_score -= 20
            return "Go deeper", max(0, quality_score), knee_angle
        elif knee_angle < 70:
            quality_score -= 15
            return "Not too deep", max(0, quality_score), knee_angle
        
        if hip_angle > 140:
            quality_score -= 20
            return "Push hips back", max(0, quality_score), knee_angle
        
        return "Perfect form", max(0, quality_score), knee_angle
    
    def analyze_squat_front_depth(self, joint_angles):
        """Squat from front - FIXED THRESHOLDS"""
        quality_score = 100
        
        left_knee = joint_angles.get("left_knee", 180)
        right_knee = joint_angles.get("right_knee", 180)
        avg_knee = (left_knee + right_knee) / 2
        knee_diff = abs(left_knee - right_knee)
        
        left_hip_depth = joint_angles.get("left_hip_depth", 0)
        right_hip_depth = joint_angles.get("right_hip_depth", 0)
        avg_hip_depth = (left_hip_depth + right_hip_depth) / 2
        
        if avg_knee > 160:
            quality_score = 0  # Standing still = no quality score yet
            return "Ready to start", 0, avg_knee
        
        if knee_diff > 15:
            quality_score -= 30
            return "Balance left and right", max(0, quality_score), avg_knee
        
        if avg_knee > 120:
            quality_score -= 20
            return "Go deeper", max(0, quality_score), avg_knee
        elif avg_knee < 70:
            quality_score -= 15
            return "Not too deep", max(0, quality_score), avg_knee
        
        if avg_hip_depth < 0.05:
            quality_score -= 15
            return "Push hips back", max(0, quality_score), avg_knee
        
        return "Perfect form", max(0, quality_score), avg_knee
    
    def analyze_shoulder_front(self, joint_angles):
        """Shoulder raises"""
        quality_score = 100
        
        left_shoulder = joint_angles.get("left_shoulder", 180)
        right_shoulder = joint_angles.get("right_shoulder", 180)
        left_elbow = joint_angles.get("left_elbow", 180)
        right_elbow = joint_angles.get("right_elbow", 180)
        
        avg_shoulder = (left_shoulder + right_shoulder) / 2
        shoulder_diff = abs(left_shoulder - right_shoulder)
        
        if shoulder_diff > 15:
            quality_score -= 25
            return "Raise arms evenly", max(0, quality_score), avg_shoulder
        
        if avg_shoulder > 100:
            quality_score -= 20
            return "Raise higher", max(0, quality_score), avg_shoulder
        
        if left_elbow < 160 or right_elbow < 160:
            quality_score -= 15
            return "Straighten arms", max(0, quality_score), avg_shoulder
        
        return "Perfect height", max(0, quality_score), avg_shoulder
    
    def count_squat_reps(self, avg_knee_angle):
        """FIXED: Count squat reps with better thresholds"""
        self.rep_history.append(avg_knee_angle)
        
        if len(self.rep_history) < 2:
            return False
        
        # FIXED: Enter bottom when knee angle drops below 100° (was 110°)
        if avg_knee_angle < 105 and not self.in_bottom_position:
            self.in_bottom_position = True
            print(f"DEBUG: Entered bottom position at {avg_knee_angle:.1f}°")
        
        # FIXED: Count rep when returning to 130° or more (was 150°)
        if avg_knee_angle > 130 and self.in_bottom_position:
            if time.time() - self.last_rep_time > 0.8:  # Reduced cooldown
                self.in_bottom_position = False
                self.last_rep_time = time.time()
                self.rep_times.append(time.time())
                print(f"DEBUG: Rep counted! Returned to {avg_knee_angle:.1f}°")
                return True
        
        return False
    
    def count_shoulder_reps(self, avg_shoulder_angle):
        """Count shoulder reps"""
        self.rep_history.append(avg_shoulder_angle)
        
        if len(self.rep_history) < 2:
            return False
        
        if avg_shoulder_angle < 90 and not self.in_bottom_position:
            self.in_bottom_position = True
        
        if avg_shoulder_angle > 140 and self.in_bottom_position:
            if time.time() - self.last_rep_time > 0.8:
                self.in_bottom_position = False
                self.last_rep_time = time.time()
                self.rep_times.append(time.time())
                return True
        
        return False
    
    def get_live_feedback(self, joint_angles):
        """Main feedback routing"""
        if not joint_angles:
            return "Stand in frame", 0, "N/A"
        
        if self.exercise_start_time is None:
            self.exercise_start_time = time.time()
        
        # Velocity calculation
        primary_joint = self.config["primary_joints"][0]
        depth_key = f"{primary_joint}_depth"
        if depth_key in joint_angles:
            depth = joint_angles[depth_key]
            velocity = self.calculate_velocity(depth)
            self.depth_history.append(velocity)
        
        # Route to analysis
        analysis_func = self.config["analysis_function"]
        
        if analysis_func == "analyze_squat_side":
            feedback_text, quality, metric = self.analyze_squat_side(joint_angles)
            rep_counted = self.count_squat_reps(metric)
        elif analysis_func == "analyze_squat_front_depth":
            feedback_text, quality, metric = self.analyze_squat_front_depth(joint_angles)
            rep_counted = self.count_squat_reps(metric)
        elif analysis_func == "analyze_shoulder_front":
            feedback_text, quality, metric = self.analyze_shoulder_front(joint_angles)
            rep_counted = self.count_shoulder_reps(metric)
        else:
            return "Unknown exercise", 0, "N/A"
        
        # Tempo feedback
        avg_velocity = np.mean(list(self.depth_history)) if self.depth_history else 0
        if avg_velocity > 0.015:
            tempo = "Slow down"
        elif avg_velocity < 0.003:
            tempo = "Speed up slightly"
        else:
            tempo = "Good pace"
        
        if rep_counted:
            self.rep_quality_scores.append(quality)
            self.velocity_history.append(avg_velocity)
            self.rep_count += 1
            self.update_tiredness()
        
        return feedback_text, quality, tempo
    
    def get_session_summary(self, rpe_score=None):
        """Session summary"""
        if not self.exercise_start_time:
            return None
        
        duration = time.time() - self.exercise_start_time
        avg_quality = np.mean(self.rep_quality_scores) if self.rep_quality_scores else 0
        avg_tempo = np.mean(self.velocity_history) if self.velocity_history else 0
        
        return {
            "reps_completed": self.rep_count,
            "duration_seconds": int(duration),
            "average_quality": round(avg_quality, 1),
            "average_tempo": round(avg_tempo, 4),
            "rpe": rpe_score,
            "quality_per_rep": self.rep_quality_scores,
            "tempo_per_rep": self.velocity_history
        }


# ============================================
# MAIN DEMO
# ============================================

def main():
    # API Configuration
    API_BASE_URL = "http://localhost:8000"
    
    print("\n" + "="*50)
    print("PHYSALIGN - Patient Login")
    print("="*50)
    access_code = input("Enter your 8-digit access code (or press Enter for demo): ").strip().upper()
    
    exercise_config = None
    if access_code:
        try:
            print(f"Fetching program for code: {access_code}...")
            response = requests.get(f"{API_BASE_URL}/api/program/{access_code}")
            if response.status_code == 200:
                program_data = response.json()
                print(f"✅ Welcome, {program_data.get('patient_name', 'Patient')}!")
                
                # Let user choose exercise if multiple
                exercises = program_data.get('exercises', [])
                if exercises:
                    print("\nYour assigned exercises:")
                    for i, ex in enumerate(exercises):
                        print(f"{i+1}. {ex['name']} ({ex['sets']}x{ex['reps']})")
                    
                    choice = input("\nSelect exercise number (1): ").strip()
                    choice = int(choice) - 1 if choice else 0
                    selected_ex = exercises[choice]
                    
                    # Map to library key or create config
                    exercise_config = {
                        "name": selected_ex['name'],
                        "camera_angle": "side", # Default
                        "tracking_mode": "single_side",
                        "primary_joints": ["left_knee", "left_hip"], # Default
                        "analysis_function": "analyze_squat_side", # Default
                        "reps_target": selected_ex['reps'],
                        "record_video": True
                    }
                    
                    # Try to find better match in library
                    for key, cfg in EXERCISE_LIBRARY.items():
                        if cfg['name'].lower() in selected_ex['name'].lower():
                            exercise_config.update(cfg)
                            exercise_config['reps_target'] = selected_ex['reps']
                            break
                else:
                    print("❌ No exercises found in your program.")
            else:
                print(f"❌ Error: {response.json().get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"⚠️ Could not connect to API: {e}")
    
    if not exercise_config:
        print("Using demo mode (Squats)...")
        exercise_key = "squat"
        exercise_config = EXERCISE_LIBRARY[exercise_key]
    
    # Initialize (VERTICAL orientation)
    cap = cv.VideoCapture(0)
    cap.set(cv.CAP_PROP_FRAME_WIDTH, 720)
    cap.set(cv.CAP_PROP_FRAME_HEIGHT, 1280)
    
    # Video recording
    out = None
    if exercise_config["record_video"]:
        fourcc = cv.VideoWriter_fourcc(*'mp4v')
        out = cv.VideoWriter('patient_session.mp4', fourcc, 20.0, (1280, 720))
    
    # Trackers
    body_baseline = None
    body_history = None
    body_calibrating = True
    body_calib_start = None
    body_prev_angles = {}
    
    feedback_engine = ExerciseFeedback(exercise_config)
    voice = VoiceFeedback()
    
    print("\n" + "="*50)
    print("PHYSALIGN - Exercise Session")
    print("="*50)
    print(f"Exercise: {exercise_config['name']}")
    print(f"Camera: {exercise_config['camera_angle'].upper()} view")
    print(f"Target: {exercise_config['reps_target']} reps")
    print("="*50 + "\n")
    print("Stand 8-10 feet from camera")
    print("Press 'q' to finish\n")
    
    recording = False
    
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        # Body tracking
        frame, body_baseline, body_history, body_smoothed, current_angles, body_calibrating, body_calib_start, body_prev_angles = track_body_stress(
            frame, body_baseline, body_history, body_calibrating, body_calib_start, body_prev_angles
        )
        
        if not body_calibrating and current_angles:
            if not recording:
                recording = True
                print("🎥 Session started!")
                voice.speak("Starting exercise")
            
            # Get feedback
            feedback_text, quality, tempo = feedback_engine.get_live_feedback(current_angles)
            
            # Voice guidance
            voice.speak(feedback_text)
            
            # Face stress
            face_stress = track_face_stress_simple(frame)
            
            # Tiredness
            tiredness = feedback_engine.update_tiredness()
            
            # Draw modern UI
            frame = draw_modern_ui(
                frame,
                exercise_config['name'],
                feedback_engine.rep_count,
                exercise_config['reps_target'],
                quality,
                feedback_text,
                face_stress,
                tiredness,
                tempo
            )
        
        # Record frame
        if recording and out:
            out.write(frame)
        
        cv.imshow("Physalign - Live Session", frame)
        
        if cv.waitKey(10) & 0xFF == ord('q'):
            break
    
    # Cleanup
    cap.release()
    if out:
        out.release()
    cv.destroyAllWindows()
    
    # Session summary
    print("\n" + "="*50)
    print("EXERCISE COMPLETE!")
    print("="*50)
    
    voice.speak("Exercise complete. Rate your exertion")
    rpe = input("Rate your exertion (1=Very Easy, 10=Maximum): ")
    
    summary = feedback_engine.get_session_summary(int(rpe))
    
    if summary:
        print(f"\n📊 SESSION SUMMARY")
        print(f"  Exercise: {exercise_config['name']}")
        print(f"  Reps: {summary['reps_completed']}/{exercise_config['reps_target']}")
        print(f"  Duration: {summary['duration_seconds']} seconds")
        print(f"  Avg Form Quality: {summary['average_quality']}%")
        print(f"  Avg Tempo: {summary['average_tempo']:.4f}")
        print(f"  RPE: {summary['rpe']}/10")
        
        if exercise_config["record_video"]:
            print(f"\n🎥 Video saved: patient_session.mp4")
            print(f"✅ Ready for physiotherapist review")
            voice.speak("Session saved successfully")
        else:
            print(f"\n📈 Data saved for review")
        
        # POST to API
        if access_code:
            try:
                print("\n📤 Syncing data with dashboard...")
                payload = {
                    "access_code": access_code,
                    "exercise_name": exercise_config['name'],
                    "rep_count": summary['reps_completed'],
                    "target_reps": exercise_config['reps_target'],
                    "duration_seconds": summary['duration_seconds'],
                    "average_quality": summary['average_quality'],
                    "rpe": summary['rpe'],
                    "video_url": "patient_session.mp4", # Local path or placeholder
                    "metrics": {
                        "average_tempo": summary['average_tempo'],
                        "quality_per_rep": summary['quality_per_rep'],
                        "tempo_per_rep": summary['tempo_per_rep']
                    }
                }
                res = requests.post(f"{API_BASE_URL}/api/sessions", json=payload)
                if res.status_code == 200:
                    print("✅ Session synced successfully!")
                else:
                    print(f"❌ Sync failed: {res.text}")
            except Exception as e:
                print(f"⚠️ Could not sync with API: {e}")

        print(f"\n💬 Your physiotherapist will review within 24h")
    
    print("\n" + "="*50)


if __name__ == "__main__":
    main()
