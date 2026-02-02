'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Save, ChevronLeft, Activity } from 'lucide-react';
import { supabase } from '@/lib/dashboard/supabase';
import { Exercise } from '@/lib/dashboard/types';
import { generateAccessCode } from '@/lib/dashboard/utils';
import { useToast } from '@/components/dashboard/useToast';

export default function CreateProgram() {
  const [patientName, setPatientName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: 10, notes: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const router = useRouter();
  const { success, error, ToastContainer } = useToast();

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, notes: '' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updatedExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  }

  const handleCreateProgram = async () => {
    try {
        setLoading(true)

        // Ensure user is signed in 
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            error('You must be signed in to create a program.');
            setLoading(false);
            return;
        }

        // Filter out empty exercises before submission
        const validExercises = exercises.filter(ex => ex.name.trim() !== '');

        if (validExercises.length === 0) {
            error('Please add at least one exercise with a name.');
            setLoading(false);
            return;
        }

        // Generate patient access code 
        const accessCode = generateAccessCode(8);

        // Create program in database 
        const { data, error: createError } = await supabase
            .from('exercise_programs')
            .insert([{
                physio_id: user.id,
                access_code: accessCode,
                patient_name: patientName || null,
                exercises: validExercises,
                notes: null
            }])
            .select()
            .single();
        if (createError) {
            throw createError;
        }
        setGeneratedCode(accessCode);
        success('Program created successfully!');
        setLoading(false);
    } catch(err) {
        error('Failed to create program');
        setLoading(false);
    }
  }

  // Success screen
  if (generatedCode) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-2xl">
              🎉
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Program Created!</h2>
              <p className="text-sm text-gray-600 mt-1">Share this access code with your patient</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <p className="text-3xl font-bold text-teal-600 tracking-wider">
              {generatedCode}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Copy Code
            </button>
            <button
              onClick={() => router.push('/dashboard/patients')}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ToastContainer />
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Create Exercise Program</h1>
            <p className="header-subtitle">Build a custom exercise plan for your patient</p>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard/patients")}
          className="back-button mb-6"
        >
          <ChevronLeft className="icon-sm" />
          <span>Back to Programs</span>
        </button>
        
        {/* Patient Name Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter patient's name"
            className="form-input w-full"
          />
        </div>

        {/* Exercises Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Exercises <span className="text-gray-500 font-normal">({exercises.length})</span>
          </h2>
          <button
            onClick={addExercise}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>

        {/* Exercise Cards */}
        <div className="space-y-4 mb-8">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">Exercise {index + 1}</span>
                </div>
                {exercises.length > 1 && (
                  <button
                    onClick={() => removeExercise(index)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                    aria-label="Remove exercise"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Exercise Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => updatedExercise(index, "name", e.target.value)}
                  placeholder="e.g., Squats, Push-ups, Lunges"
                  className="form-input w-full"
                />
              </div>

              {/* Sets and Reps Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => updatedExercise(index, "sets", parseInt(e.target.value) || 0)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.reps}
                    onChange={(e) => updatedExercise(index, "reps", parseInt(e.target.value) || 0)}
                    className="form-input w-full"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={exercise.notes}
                  onChange={(e) => updatedExercise(index, "notes", e.target.value)}
                  placeholder="Add instructions or notes..."
                  rows={2}
                  className="form-input w-full resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.push("/dashboard/patients")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProgram}
            disabled={loading || exercises.every((ex) => ex.name.trim() === "")}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? "Creating..." : "Create Program"}
          </button>
        </div>

      </div>
    </div>
  );
}
