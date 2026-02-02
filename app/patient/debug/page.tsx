'use client';

import { useState } from 'react';
import PoseTracker from '@/components/patient/PoseTracker';

export default function DebugPage() {
  const [exerciseState, setExerciseState] = useState({
    repCount: 0,
    quality: 100,
    feedback: 'Stand in frame',
    stressLevel: 0,
    tiredness: 0,
    tempo: 'Good pace',
    landmarks: {}
  });

  const handleExerciseUpdate = (state: any) => {
    console.log('Exercise update received:', state);
    setExerciseState(state);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Tracking Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Live Tracking</h2>
            <PoseTracker 
              onExerciseUpdate={handleExerciseUpdate}
              exerciseType="Squats"
            />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Debug Info</h2>
            <div className="space-y-3 text-white">
              <div className="flex justify-between">
                <span>Reps:</span>
                <span className="font-mono">{exerciseState.repCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className="font-mono">{exerciseState.quality}%</span>
              </div>
              <div className="flex justify-between">
                <span>Feedback:</span>
                <span className="font-mono">{exerciseState.feedback}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiredness:</span>
                <span className="font-mono">{exerciseState.tiredness}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo:</span>
                <span className="font-mono">{exerciseState.tempo}</span>
              </div>
              <div className="mt-4">
                <span className="block mb-2">Landmarks:</span>
                <pre className="text-xs bg-gray-700 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(exerciseState.landmarks, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}