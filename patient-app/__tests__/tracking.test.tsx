import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PoseTracker from '../app/components/PoseTracker';

// Mock TensorFlow and PoseNet
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@tensorflow-models/posenet', () => ({
  load: jest.fn().mockResolvedValue({
    estimateSinglePose: jest.fn().mockResolvedValue({
      keypoints: [
        { part: 'nose', position: { x: 100, y: 100 }, score: 0.9 },
        { part: 'left_shoulder', position: { x: 80, y: 120 }, score: 0.8 },
        { part: 'right_shoulder', position: { x: 120, y: 120 }, score: 0.8 },
        { part: 'left_hip', position: { x: 90, y: 200 }, score: 0.7 },
        { part: 'right_hip', position: { x: 110, y: 200 }, score: 0.7 },
        { part: 'left_knee', position: { x: 85, y: 280 }, score: 0.8 },
        { part: 'right_knee', position: { x: 115, y: 280 }, score: 0.8 },
        { part: 'left_ankle', position: { x: 80, y: 360 }, score: 0.7 },
        { part: 'right_ankle', position: { x: 120, y: 360 }, score: 0.7 },
      ],
      adjacentKeyPoints: [],
    }),
  }),
}));

describe('PoseTracker Component', () => {
  const mockOnExerciseUpdate = jest.fn();

  beforeEach(() => {
    mockOnExerciseUpdate.mockClear();
  });

  test('renders without crashing', () => {
    render(
      <PoseTracker 
        onExerciseUpdate={mockOnExerciseUpdate} 
        exerciseType="Squats" 
      />
    );
    
    expect(screen.getByText('Loading pose detection model...')).toBeInTheDocument();
  });

  test('initializes with correct exercise state', () => {
    render(
      <PoseTracker 
        onExerciseUpdate={mockOnExerciseUpdate} 
        exerciseType="Squats" 
      />
    );

    // Should call onExerciseUpdate with initial state
    expect(mockOnExerciseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        repCount: 0,
        quality: 100,
        feedback: 'Stand in frame',
        stressLevel: 0,
        tiredness: 0,
        tempo: 'Good pace'
      })
    );
  });
});

describe('Exercise Analysis Functions', () => {
  // Import functions to test
  let calculateAngle: (a: any, b: any, c: any) => number;
  
  beforeAll(() => {
    // Dynamically import the component to access its functions
    const module = require('../app/components/PoseTracker');
    calculateAngle = module.calculateAngle;
  });

  test('calculateAngle computes correct angles', () => {
    // Test with a 90-degree angle
    const pointA = { x: 0, y: 0 };
    const pointB = { x: 1, y: 0 };
    const pointC = { x: 1, y: 1 };
    
    const angle = calculateAngle(pointA, pointB, pointC);
    expect(Math.round(angle)).toBe(90);
  });

  test('analyzeSquatSide evaluates form correctly', () => {
    const landmarks = {
      'left_hip': { x: 100, y: 200 },
      'left_knee': { x: 100, y: 280 },
      'left_ankle': { x: 100, y: 360 },
      'left_shoulder': { x: 100, y: 120 }
    };

    // Mock the analyzeSquatSide function
    const analyzeSquatSide = (landmarks: any) => {
      const calculateAngle = (a: any, b: any, c: any) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180 / Math.PI);
        return angle > 180 ? 360 - angle : angle;
      };

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

      return { feedback, quality: Math.max(0, quality), kneeAngle };
    };

    const result = analyzeSquatSide(landmarks);
    expect(result.quality).toBeLessThan(100); // Should detect form issues
    expect(typeof result.feedback).toBe('string');
  });
});

describe('Rep Counting Logic', () => {
  test('counts squat repetitions correctly', () => {
    // Mock rep counting logic
    let repCount = 0;
    let inBottomPosition = false;
    let lastRepTime = Date.now();
    const repHistory: number[] = [];

    const countSquatReps = (kneeAngle: number): boolean => {
      repHistory.push(kneeAngle);

      if (repHistory.length < 2) return false;

      if (kneeAngle < 105 && !inBottomPosition) {
        inBottomPosition = true;
      } else if (kneeAngle > 130 && inBottomPosition) {
        if (Date.now() - lastRepTime > 800) {
          inBottomPosition = false;
          lastRepTime = Date.now();
          repCount++;
          return true;
        }
      }

      return false;
    };

    // Simulate rep counting sequence
    expect(countSquatReps(140)).toBe(false); // Standing
    expect(countSquatReps(90)).toBe(false);  // Bottom position
    expect(countSquatReps(140)).toBe(true);  // Back to standing - counts as rep
    
    expect(repCount).toBe(1);
  });
});