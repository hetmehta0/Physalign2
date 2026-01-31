'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes: string;
}

interface Program {
  id: string;
  patient_name: string | null;
  exercises: Exercise[];
  notes: string | null;
}

export default function ExerciseList() {
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load program from sessionStorage
    const storedProgram = sessionStorage.getItem('program');
    const accessCode = sessionStorage.getItem('accessCode');

    if (!storedProgram || !accessCode) {
      router.push('/');
      return;
    }

    try {
      // Safely parse the program data
      const parsedProgram = JSON.parse(storedProgram);
      setProgram(parsedProgram);
    } catch (error) {
      console.error('Error parsing program data:', error);
      console.log('Stored program data:', storedProgram); // Log the raw data for debugging
      router.push('/');
    }
  }, [router]);

  const handleStartExercise = (index: number) => {
    setSelectedExercise(index);
    sessionStorage.setItem('currentExercise', JSON.stringify(program?.exercises[index]));
    router.push('/record');
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {program.patient_name ? `${program.patient_name}'s Program` : 'Your Exercise Program'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{program.exercises.length} exercises assigned</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* Program Notes */}
      {program.notes && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Instructions from your physiotherapist</h3>
            <p className="text-sm text-blue-800">{program.notes}</p>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {program.exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{exercise.name}</h3>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>{exercise.sets} sets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>{exercise.reps} reps each</span>
                    </div>
                  </div>

                  {exercise.notes && (
                    <p className="text-sm text-gray-600 mb-4">{exercise.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleStartExercise(index)}
                  className="ml-4 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Record
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
