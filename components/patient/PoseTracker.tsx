'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PoseLandmarks {
  [key: string]: { x: number; y: number; z?: number };
}

interface ExerciseState {
  repCount: number;
  quality: number;
  feedback: string;
  stressLevel: number;
  tiredness: number;
  tempo: string;
  landmarks: PoseLandmarks;
  fatigueLevel?: number;
  fatigueNotes?: string;
}

const PoseTracker: React.FC<{
  onExerciseUpdate: (state: ExerciseState) => void;
  exerciseType: string;
}> = ({ onExerciseUpdate, exerciseType }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const netRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const exerciseStateRef = useRef({
    repCount: 0,
    quality: 100,
    feedback: 'Stand in frame',
    stressLevel: 0,
    tiredness: 0,
    tempo: 'Good pace',
    landmarks: {} as PoseLandmarks,
    fatigueLevel: undefined,
    fatigueNotes: '',
    lastRepTime: Date.now(),
    inBottomPosition: false,
    repHistory: [] as number[],
    repTimes: [] as number[],
    repQualityScores: [] as number[],
    repStressLevels: [] as number[],
    exerciseStartTime: Date.now(),
    depthHistory: [] as number[],
    lastDepth: null as number | null,
    lastTime: null as number | null,
    isCalibrating: true,
    calibrationBaseline: {} as PoseLandmarks,
    calibrationTimeout: 3000, // 3 seconds for calibration
    calibrationStartTime: Date.now(),
  });

  // Calculate angle between three points
  const calculateAngle = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  // Analyze squat from side view
  const analyzeSquatSide = (landmarks: PoseLandmarks): { feedback: string; quality: number; kneeAngle: number } => {
    const leftHip = landmarks['left_hip'];
    const leftKnee = landmarks['left_knee'];
    const leftAnkle = landmarks['left_ankle'];

    if (!leftHip || !leftKnee || !leftAnkle) {
      return { feedback: 'Full body needed', quality: 0, kneeAngle: 0 };
    }

    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    
    let quality = 100;
    let feedback = 'Perfect form';

    if (kneeAngle > 120) {
      quality -= 20;
      feedback = 'Go deeper';
    } else if (kneeAngle < 70) {
      quality -= 15;
      feedback = 'Not too deep';
    }

    // Hip angle check
    const leftShoulder = landmarks['left_shoulder'];
    if (leftHip && leftShoulder) {
      const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (hipAngle > 140) {
        quality -= 20;
        feedback = 'Push hips back';
      }
    }

    return { feedback, quality: Math.max(0, quality), kneeAngle };
  };

  // Analyze squat from front view
  const analyzeSquatFront = (landmarks: PoseLandmarks): { feedback: string; quality: number; kneeAngle: number } => {
    const leftKnee = landmarks['left_knee'];
    const rightKnee = landmarks['right_knee'];
    const leftHip = landmarks['left_hip'];
    const rightHip = landmarks['right_hip'];

    if (!leftKnee || !rightKnee) {
      return { feedback: 'Full body needed', quality: 0, kneeAngle: 0 };
    }

    const avgKnee = (calculateAngle(landmarks['left_hip'], leftKnee, landmarks['left_ankle']) + 
                    calculateAngle(landmarks['right_hip'], rightKnee, landmarks['right_ankle'])) / 2;
    const kneeDiff = Math.abs(
      calculateAngle(landmarks['left_hip'], leftKnee, landmarks['left_ankle']) -
      calculateAngle(landmarks['right_hip'], rightKnee, landmarks['right_ankle'])
    );

    let quality = 100;
    let feedback = 'Perfect form';

    if (kneeDiff > 15) {
      quality -= 30;
      feedback = 'Balance left and right';
    } else if (avgKnee > 120) {
      quality -= 20;
      feedback = 'Go deeper';
    } else if (avgKnee < 70) {
      quality -= 15;
      feedback = 'Not too deep';
    }

    return { feedback, quality: Math.max(0, quality), kneeAngle: avgKnee };
  };

  // Analyze shoulder raises
  const analyzeShoulderRaises = (landmarks: PoseLandmarks): { feedback: string; quality: number; shoulderAngle: number } => {
    const leftShoulder = landmarks['left_shoulder'];
    const leftElbow = landmarks['left_elbow'];
    const rightShoulder = landmarks['right_shoulder'];
    const rightElbow = landmarks['right_elbow'];

    if (!leftShoulder || !rightShoulder) {
      return { feedback: 'Shoulders needed', quality: 0, shoulderAngle: 0 };
    }

    const leftArmAngle = calculateAngle(landmarks['left_hip'], leftShoulder, leftElbow);
    const rightArmAngle = calculateAngle(landmarks['right_hip'], rightShoulder, rightElbow);
    const avgShoulder = (leftArmAngle + rightArmAngle) / 2;
    const shoulderDiff = Math.abs(leftArmAngle - rightArmAngle);

    let quality = 100;
    let feedback = 'Perfect height';

    if (shoulderDiff > 15) {
      quality -= 25;
      feedback = 'Raise arms evenly';
    } else if (avgShoulder > 100) {
      quality -= 20;
      feedback = 'Raise higher';
    }

    if ((leftElbow && calculateAngle(leftShoulder, leftElbow, landmarks['left_wrist']) < 160) ||
        (rightElbow && calculateAngle(rightShoulder, rightElbow, landmarks['right_wrist']) < 160)) {
      quality -= 15;
      feedback = 'Straighten arms';
    }

    return { feedback, quality: Math.max(0, quality), shoulderAngle: avgShoulder };
  };

  // Calibration function
  const calibrateBaseline = (landmarks: PoseLandmarks) => {
    const state = exerciseStateRef.current;
    
    if (state.isCalibrating) {
      // Collect baseline for 3 seconds
      if (Date.now() - state.calibrationStartTime < state.calibrationTimeout) {
        // Store initial landmarks as baseline
        if (Object.keys(state.calibrationBaseline).length === 0) {
          state.calibrationBaseline = { ...landmarks };
        }
        return 'Calibrating... Stand still';
      } else {
        state.isCalibrating = false;
        return 'Calibration complete! Begin exercise';
      }
    }
    return null;
  };

  // Compare current pose to calibration baseline
  const compareToBaseline = (currentLandmarks: PoseLandmarks): number => {
    const state = exerciseStateRef.current;
    if (state.isCalibrating || Object.keys(state.calibrationBaseline).length === 0) {
      return 100; // Perfect match during calibration
    }

    let totalDifference = 0;
    let keypointCount = 0;

    // Compare key landmarks
    const keyLandmarks = ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder'];
    
    keyLandmarks.forEach(part => {
      if (currentLandmarks[part] && state.calibrationBaseline[part]) {
        const current = currentLandmarks[part];
        const baseline = state.calibrationBaseline[part];
        
        // Calculate Euclidean distance
        const diff = Math.sqrt(
          Math.pow(current.x - baseline.x, 2) + 
          Math.pow(current.y - baseline.y, 2)
        );
        
        totalDifference += diff;
        keypointCount++;
      }
    });

    if (keypointCount === 0) return 100;
    
    // Normalize difference (lower is better)
    const avgDifference = totalDifference / keypointCount;
    // Convert to quality score (0-100)
    const quality = Math.max(0, 100 - (avgDifference * 0.5));
    return quality;
  };

  // Count squat reps with calibration
  const countSquatReps = (kneeAngle: number, landmarks: PoseLandmarks): boolean => {
    const state = exerciseStateRef.current;
    state.repHistory.push(kneeAngle);

    if (state.repHistory.length < 2) return false;

    // Check if close to baseline (standing position)
    const baselineQuality = compareToBaseline(landmarks);
    
    // Enter bottom position when knee angle drops below threshold
    if (kneeAngle < 105 && !state.inBottomPosition) {
      state.inBottomPosition = true;
    }
    // Count rep when returning to near-baseline position
    else if (baselineQuality > 85 && state.inBottomPosition) { // Close to calibrated standing position
      if (Date.now() - state.lastRepTime > 800) { // 0.8 second cooldown
        state.inBottomPosition = false;
        state.lastRepTime = Date.now();
        state.repTimes.push(Date.now());
        state.repStressLevels.push(state.stressLevel);
        return true;
      }
    }

    return false;
  };

  // Count shoulder raise reps
  const countShoulderReps = (shoulderAngle: number): boolean => {
    const state = exerciseStateRef.current;
    state.repHistory.push(shoulderAngle);

    if (state.repHistory.length < 2) return false;

    if (shoulderAngle < 90 && !state.inBottomPosition) {
      state.inBottomPosition = true;
    } else if (shoulderAngle > 140 && state.inBottomPosition) {
      if (Date.now() - state.lastRepTime > 800) {
        state.inBottomPosition = false;
        state.lastRepTime = Date.now();
        state.repTimes.push(Date.now());
        return true;
      }
    }

    return false;
  };

  // Calculate velocity
  const calculateVelocity = (currentDepth: number): number => {
    const state = exerciseStateRef.current;
    const currentTime = Date.now();

    if (state.lastDepth === null || state.lastTime === null) {
      state.lastDepth = currentDepth;
      state.lastTime = currentTime;
      return 0;
    }

    const depthChange = Math.abs(currentDepth - state.lastDepth);
    const timeChange = (currentTime - state.lastTime) / 1000; // Convert to seconds

    const velocity = timeChange > 0 ? depthChange / timeChange : 0;

    state.lastDepth = currentDepth;
    state.lastTime = currentTime;

    return velocity;
  };

  // Update tiredness based on rep count and time
  const updateTiredness = (): number => {
    const state = exerciseStateRef.current;
    
    if (state.repCount === 0) return 0;

    // Base tiredness on rep count
    let repFactor = (state.repCount / 10) * 60; // Assuming 10 reps as target

    // Check if reps are slowing down
    if (state.repTimes.length >= 3) {
      const recentTimes = state.repTimes.slice(-3);
      if (recentTimes.length >= 2 && recentTimes[recentTimes.length - 1] > recentTimes[0] * 1.3) {
        repFactor += 20;
      }
    }

    state.tiredness = Math.min(100, repFactor);
    return state.tiredness;
  };

  // Main tracking function
  const trackPose = async () => {
    if (!videoRef.current || !canvasRef.current || !netRef.current) {
      animationRef.current = requestAnimationFrame(trackPose);
      return;
    }

    try {
      // Ensure video is actually playing
      if (videoRef.current.readyState < 2) { // HAVE_CURRENT_DATA
        animationRef.current = requestAnimationFrame(trackPose);
        return;
      }

      const pose = await netRef.current.estimateSinglePose(videoRef.current, {
        flipHorizontal: false,
        decodingMethod: 'single-person',
        maxDetections: 1,
        scoreThreshold: 0.3, // Lower threshold for better detection
      });

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(trackPose);
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw pose skeleton
      if (pose && pose.keypoints) {
        // Draw keypoints
        pose.keypoints.forEach((keypoint: any) => {
          if (keypoint.score > 0.2) { // Lower confidence threshold
            ctx.beginPath();
            ctx.arc(keypoint.position.x, keypoint.position.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#00FFFF'; // Bright cyan
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw skeleton connections
        if (pose.adjacentKeyPoints) {
          const adjacentKeyPoints = pose.adjacentKeyPoints.filter(
            (pair: any) => pair[0].score > 0.2 && pair[1].score > 0.2
          );

          adjacentKeyPoints.forEach((pair: any) => {
            ctx.beginPath();
            ctx.moveTo(pair[0].position.x, pair[0].position.y);
            ctx.lineTo(pair[1].position.x, pair[1].position.y);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00FF00'; // Bright green
            ctx.stroke();
          });
        }

        // Process exercise-specific logic
        const landmarks: PoseLandmarks = {};
        pose.keypoints.forEach((kp: any) => {
          if (kp.score > 0.2) { // Match drawing threshold
            landmarks[kp.part] = kp.position;
          }
        });

        // Handle calibration
        const calibrationStatus = calibrateBaseline(landmarks);
        
        // Draw debug info
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Keypoints: ${Object.keys(landmarks).length}`, 10, 30);
        const avgScore = pose.keypoints.reduce((sum: number, kp: any) => sum + kp.score, 0) / pose.keypoints.length;
        ctx.fillText(`Score: ${avgScore.toFixed(2)}`, 10, 50);
        
        if (calibrationStatus) {
          ctx.fillStyle = '#FFFF00';
          ctx.fillText(calibrationStatus, 10, 70);
        } else {
          const baselineQuality = compareToBaseline(landmarks);
          ctx.fillText(`Match: ${baselineQuality.toFixed(1)}%`, 10, 70);
        }
        
        exerciseStateRef.current.landmarks = { ...landmarks };

        let feedback = '';
        let quality = 0;
        let metric = 0;
        let repCounted = false;

        // Exercise-specific analysis
        if (exerciseType.toLowerCase().includes('squat')) {
          if (typeof window !== 'undefined' && window.location.search.includes('front')) {
            // Front view squat
            const result = analyzeSquatFront(landmarks);
            feedback = result.feedback;
            quality = result.quality;
            metric = result.kneeAngle;

            repCounted = countSquatReps(metric, landmarks);
          } else {
            // Side view squat
            const result = analyzeSquatSide(landmarks);
            feedback = result.feedback;
            quality = result.quality;
            metric = result.kneeAngle;

            repCounted = countSquatReps(metric, landmarks);
          }
        } else if (exerciseType.toLowerCase().includes('shoulder') || exerciseType.toLowerCase().includes('raise')) {
          const result = analyzeShoulderRaises(landmarks);
          feedback = result.feedback;
          quality = result.quality;
          metric = result.shoulderAngle;

          repCounted = countShoulderReps(metric);
        } else {
          feedback = 'Exercise not recognized';
          quality = 0;
        }

        // Handle rep counting
        if (repCounted) {
          exerciseStateRef.current.repCount++;
          exerciseStateRef.current.repQualityScores.push(quality);
        }

        // Calculate tempo
        if (landmarks['left_hip']) {
          const depth = landmarks['left_hip'].z || 0;
          const velocity = calculateVelocity(depth);
          exerciseStateRef.current.depthHistory.push(velocity);

          const avgVelocity = exerciseStateRef.current.depthHistory.reduce((a, b) => a + b, 0) / 
                              exerciseStateRef.current.depthHistory.length;
          
          let tempo = 'Good pace';
          if (avgVelocity > 0.015) {
            tempo = 'Slow down';
          } else if (avgVelocity < 0.003) {
            tempo = 'Speed up slightly';
          }
          exerciseStateRef.current.tempo = tempo;
        }

        // Update tiredness
        const tiredness = updateTiredness();

        // Update state
        const currentState = exerciseStateRef.current;
        onExerciseUpdate({
          repCount: currentState.repCount,
          quality,
          feedback,
          stressLevel: 0, // We could add face tracking later
          tiredness,
          tempo: currentState.tempo,
          landmarks,
          fatigueLevel: currentState.fatigueLevel,
          fatigueNotes: currentState.fatigueNotes
        });
      }
    } catch (error) {
      console.error('Error in pose tracking:', error);
    }

    animationRef.current = requestAnimationFrame(trackPose);
  };

  // Initialize camera
  const initCamera = async (useRearCamera = false) => {
    console.log('Initializing camera...');
    try {
      const constraints = useRearCamera 
        ? { 
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 }, 
              facingMode: { exact: 'environment' } // Rear camera
            }
          }
        : {
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 }, 
              facingMode: 'user' 
            }
          };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('Camera stream obtained');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          // Set canvas dimensions to match video
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            console.log(`Canvas set to ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          }
          videoRef.current?.play().catch(err => console.error('Error playing video:', err));
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  // Initialize TensorFlow and PoseNet
  const initTensorFlow = async () => {
    console.log('Initializing TensorFlow...');
    setIsLoading(true);
    
    try {
      // Dynamically load TensorFlow and PoseNet
      const tfModule = await import('@tensorflow/tfjs');
      console.log('TensorFlow loaded:', !!tfModule);
      
      const posenetModule = await import('@tensorflow-models/posenet');
      console.log('PoseNet loaded:', !!posenetModule);
      
      (window as any).tf = tfModule;
      (window as any).posenet = posenetModule;

      // Load the PoseNet model
      console.log('Loading PoseNet model...');
      const net = await posenetModule.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 1280, height: 720 }, // Match camera resolution
        multiplier: 0.75,
      });
      
      console.log('Model loaded successfully');
      netRef.current = net;
      setIsLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing TensorFlow/PoseNet:', error);
      setError('Failed to load pose detection model');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, initializing...');
    initTensorFlow();
    initCamera();

    return () => {
      console.log('Component unmounting, cleaning up...');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Start tracking - canvas sizing handled in video metadata callback
      animationRef.current = requestAnimationFrame(trackPose);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded]);

  return (
    <div className="relative w-full aspect-[9/16] max-w-2xl mx-auto"> {/* Vertical aspect ratio */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
          <div className="text-white text-center p-4 bg-red-600 rounded-lg max-w-md">
            <div className="font-bold mb-2">Error</div>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                initTensorFlow();
                initCamera();
              }}
              className="mt-3 px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading pose detection model...</p>
          </div>
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover rounded-lg"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full rounded-lg"
      />
    </div>
  );
};

export default PoseTracker;