'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Success() {
  const [exerciseName, setExerciseName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const completed = sessionStorage.getItem('completedExercise');
    if (completed) {
      setExerciseName(completed);
    }
  }, []);

  const handleBackToExercises = () => {
    sessionStorage.removeItem('completedExercise');
    sessionStorage.removeItem('currentExercise');
    router.push('/exercises');
  };

  const handleFinish = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Great Work!</h1>
          
          {exerciseName && (
            <p className="text-lg text-gray-600 mb-6">
              You've completed <span className="font-semibold text-teal-600">{exerciseName}</span>
            </p>
          )}

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-teal-900">
              ✓ Video uploaded successfully<br />
              ✓ Your physiotherapist will review it soon
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToExercises}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Continue with Next Exercise
            </button>
            
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Finish Session
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              💬 Need help? Contact your physiotherapist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
