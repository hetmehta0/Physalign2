'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/patient/supabase';
import PoseTracker from '@/components/patient/PoseTracker';
import FatigueRating from '@/components/patient/FatigueRating';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes: string;
}

interface ExerciseState {
  repCount: number;
  quality: number;
  feedback: string;
  stressLevel: number;
  tiredness: number;
  tempo: string;
  landmarks: { [key: string]: { x: number; y: number; z?: number } };
  fatigueLevel?: number;
  fatigueNotes?: string;
}

export default function RecordExercise() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    repCount: 0,
    quality: 100,
    feedback: 'Stand in frame',
    stressLevel: 0,
    tiredness: 0,
    tempo: 'Good pace',
    landmarks: {},
    fatigueLevel: 5,
    fatigueNotes: ''
  });
  const [sessionMetrics, setSessionMetrics] = useState<any[]>([]);
  const [useRearCamera, setUseRearCamera] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(false);
  
  // Initialize camera with selected mode
  useEffect(() => {
    if (videoRef.current) {
      startCamera();
    }
  }, [useRearCamera]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Load exercise from sessionStorage
    const storedExercise = sessionStorage.getItem('currentExercise');
    if (!storedExercise) {
      router.push('/exercises');
      return;
    }

    setExercise(JSON.parse(storedExercise));
    startCamera();

    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  const startCamera = async () => {
    try {
      const constraints = useRearCamera 
        ? {
            video: { facingMode: { exact: 'environment' }, width: 1280, height: 720 },
            audio: true
          }
        : {
            video: { facingMode: 'user', width: 1280, height: 720 },
            audio: true
          };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Please allow camera access to record your exercise');
    }
  };

  const startRecording = () => {
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          beginRecording();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const beginRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    setExerciseState({
      repCount: 0,
      quality: 100,
      feedback: 'Calibrating... Stand still',
      stressLevel: 0,
      tiredness: 0,
      tempo: 'Good pace',
      landmarks: {},
      fatigueLevel: 5,
      fatigueNotes: ''
    });
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const retakeVideo = () => {
    setRecordedBlob(null);
    startCamera();
  };

  const handleExerciseUpdate = (state: ExerciseState) => {
    setExerciseState(state);
    
    // Store metrics periodically
    // Store metrics for each rep
    if (state.repCount > 0 && sessionMetrics.length === 0) {
      // First rep - add initial entry
      setSessionMetrics([
        {
          timestamp: Date.now(),
          repNumber: 1,
          repCount: state.repCount,
          quality: state.quality,
          feedback: state.feedback,
          stressLevel: state.stressLevel,
          tiredness: state.tiredness,
          tempo: state.tempo,
          landmarks: state.landmarks,
          fatigueLevel: state.fatigueLevel,
          fatigueNotes: state.fatigueNotes
        }
      ]);
    } else if (state.repCount > 0 && sessionMetrics.length > 0) {
      // Check if rep count increased
      const lastRepCount = sessionMetrics[sessionMetrics.length - 1]?.repCount || 0;
      if (state.repCount > lastRepCount) {
        // New rep detected
        setSessionMetrics(prev => [
          ...prev,
          {
            timestamp: Date.now(),
            repNumber: state.repCount,
            repCount: state.repCount,
            quality: state.quality,
            feedback: state.feedback,
            stressLevel: state.stressLevel,
            tiredness: state.tiredness,
            tempo: state.tempo,
            landmarks: state.landmarks,
            fatigueLevel: state.fatigueLevel,
            fatigueNotes: state.fatigueNotes
          }
        ]);
      }
    }
  };

  const handleFatigueChange = (level: number, notes: string) => {
    setExerciseState(prev => ({
      ...prev,
      fatigueLevel: level,
      fatigueNotes: notes
    }));
  };
  
  const submitRecording = async () => {
    if (!exercise) return;
  
    setUploading(true);
  
    try {
      const accessCode = sessionStorage.getItem('accessCode');
      if (!accessCode) throw new Error('No access code');
  
      let videoUrl = '';
            
      // Upload video if recorded
      if (recordedBlob) {
        const timestamp = Date.now();
        const fileName = `${accessCode}/${exercise.name.replace(/\s+/g, '_')}_${timestamp}.webm`;
              
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('exercise-videos')
          .upload(fileName, recordedBlob, {
            contentType: 'video/webm',
            upsert: false
          });
  
        if (uploadError) throw uploadError;
  
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('exercise-videos')
          .getPublicUrl(fileName);
              
        videoUrl = publicUrl;
      }
  
      // Submit session to FastAPI
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: accessCode,
          exercise_name: exercise.name,
          rep_count: exerciseState.repCount,
          target_reps: exercise.reps * exercise.sets,
          completion_percentage: Math.min(100, (exerciseState.repCount / (exercise.reps * exercise.sets)) * 100),
          video_url: videoUrl,
          metrics: sessionMetrics,
          fatigue_level: exerciseState.fatigueLevel,
          fatigue_notes: exerciseState.fatigueNotes
        })
      });
  
      if (!response.ok) throw new Error('Failed to submit session');
  
      // Navigate to success page
      sessionStorage.setItem('completedExercise', exercise.name);
      router.push('/success');
            
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload session. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!exercise) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{exercise.name}</h1>
              <p className="text-sm text-gray-400">{exercise.sets} sets × {exercise.reps} reps</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUseRearCamera(!useRearCamera)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {useRearCamera ? '📱 Front Cam' : '📱 Rear Cam'}
              </button>
              <button
                onClick={() => setShowZoomControls(!showZoomControls)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                🔍 Zoom
              </button>
              <a 
                href="/debug" 
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Debug
              </a>
              <button
                onClick={() => router.push('/exercises')}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] max-w-2xl mx-auto shadow-2xl">
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div className="text-9xl font-bold text-white">{countdown}</div>
            </div>
          )}

          {recordedBlob ? (
            <video
              className="w-full h-full object-cover"
              src={URL.createObjectURL(recordedBlob)}
              controls
            />
          ) : (
            <div className="relative w-full h-full">
              <PoseTracker 
                onExerciseUpdate={handleExerciseUpdate}
                exerciseType={exercise.name}
              />
              {showZoomControls && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded-lg p-3 flex flex-col gap-2">
                  <div className="text-white text-xs mb-1">Zoom Controls</div>
                  <div className="text-white text-xs opacity-70">Use pinch gestures on touch devices</div>
                  <div className="text-white text-xs opacity-70">Or scroll to zoom on desktop</div>
                </div>
              )}
            </div>
          )}

          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-red-600 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Recording</span>
            </div>
          )}

          {/* Real-time Metrics Overlay */}
          {!recordedBlob && isRecording && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 rounded-lg p-4 text-white">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{exerciseState.repCount}</div>
                  <div className="text-xs text-gray-300">REPS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(exerciseState.quality)}%</div>
                  <div className="text-xs text-gray-300">QUALITY</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{exerciseState.feedback}</div>
                  <div className="text-xs text-gray-300">FEEDBACK</div>
                </div>
              </div>
              <div className="mt-2 text-center text-sm">
                <span className="text-yellow-400">{exerciseState.tempo}</span> • 
                <span className="text-red-400"> Tiredness: {Math.round(exerciseState.tiredness)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Stats */}
        {!recordedBlob && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center sm:text-left">
              <div className="text-3xl font-bold text-teal-400">{exerciseState.repCount}</div>
              <div className="text-sm text-gray-400">Repetitions</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center sm:text-left">
              <div className="text-3xl font-bold text-green-400">{Math.round(exerciseState.quality)}%</div>
              <div className="text-sm text-gray-400">Form Quality</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center sm:text-left">
              <div className="text-xl font-bold text-yellow-400">{exerciseState.feedback}</div>
              <div className="text-sm text-gray-400">Current Feedback</div>
            </div>
          </div>
        )}

        {/* Exercise Instructions */}
        {exercise.notes && !recordedBlob && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Instructions</h3>
            <p className="text-sm text-gray-400">{exercise.notes}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-4">
          {!recordedBlob ? (
            isRecording ? (
              <button
                onClick={stopRecording}
                className="px-8 py-4 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors flex items-center gap-3"
              >
                <div className="w-4 h-4 bg-white rounded-sm"></div>
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={countdown !== null}
                className="px-8 py-4 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                Start Recording
              </button>
            )
          ) : (
            <div className="flex gap-4">
              <button
                onClick={retakeVideo}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={submitRecording}
                disabled={uploading}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
