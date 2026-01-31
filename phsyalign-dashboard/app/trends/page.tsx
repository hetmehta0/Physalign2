'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Activity, 
  TrendingUp, 
  Clock, 
  Edit2, 
  Save, 
  X, 
  Plus,
  Trash2,
  Video,
  BarChart2,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Exercise, Program, Session } from '@/lib/types';
import { useToast } from '@/app/components/useToast';


export default function PatientDetail() {
  const [program, setProgram] = useState<Program | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const { success, error, ToastContainer } = useToast();
  useEffect(() => {
    async function loadProgram() {
      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setLoading(false);
        return;
      }

      if (!session) {
        router.push('/signin');
        return;
      }

      // Get program from localStorage
      const stored = localStorage.getItem('selectedProgram');
      if (!stored) {
        router.push('/patients');
        return;
      }

      // Note: localStorage data is untrusted. Always validate against server.
      const storedProgram = JSON.parse(stored);

      // Fetch fresh data from Supabase to validate and get latest state
      const { data, error } = await supabase
        .from('exercise_programs')
        .select('*')
        .eq('id', storedProgram.id)
        .single();

      if (error || !data) {
        router.push('/patients');
        return;
      }

      // Authorization: Ensure the logged-in physio owns this program
      if (data.physio_id !== session.user.id) {
        router.push('/patients');
        return;
      }

      setProgram(data);
      setExercises(data.exercises || []);

      // Fetch sessions
      const { data: sessionData, error: fetchSessionsError } = await supabase
        .from('exercise_sessions')
        .select('*')
        .eq('program_id', data.id)
        .order('completed_at', { ascending: false });

      if (!fetchSessionsError) {
        setSessions(sessionData || []);
      }

      setLoading(false);
    }

    loadProgram();
  }, [router]);
  const handleAddExercise = () => {
    const newExercise = {
      name: '',
      sets: 3,
      reps: 10,
      notes: ''
    };
    
   
    setExercises([...exercises, newExercise]);
  };
  const removeExercise = (index: number) => {
    if (confirm('Are you sure you want to remove this exercise?')) {
      setExercises(exercises.filter((_, i) => i !== index));
      success('Exercise removed');
    }
  };


  const handleBack = () => {
    router.push('/patients');
  };

  const handleSave = async (id: number) => {
    if (!program) return;

    try {
      // Update the program in Supabase
      const { error: updateError } = await supabase
        .from('exercise_programs')
        .update({
          exercises: exercises,
          updated_at: new Date().toISOString()
        })
        .eq('id', program.id);

      if (updateError) throw updateError;

      success('Changes saved successfully!');
      setEditingId(null);
    } catch (err) {
      error('Failed to save changes');
    }
  };
  
  const handleSaveProgram = async () => {
    if (!program) return;

    try {
      // Remove any exercises that have no name
      const validExercises = exercises.filter(ex => ex.name.trim() !== '');
      
      if (validExercises.length === 0) {
        error('Add at least one exercise!');
        return;
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('exercise_programs')
        .update({
          exercises: validExercises,
          updated_at: new Date().toISOString()
        })
        .eq('id', program.id);

      if (updateError) throw updateError;

      // Update local state
      setExercises(validExercises);
      setIsEditMode(false);
      success('Program saved successfully!');
    } catch (err) {
      error('Failed to save program');
    }
  };
  const handleCancel = () => {
    // Reload from program data
    if (program && program.exercises) {
      setExercises(program.exercises);
    }
    setEditingId(null);
  };

  const updateExercise = (id: number, field: string, value: string | number) => {
    setExercises(prev =>
      prev.map((ex, index) => index === id ? { ...ex, [field]: value } : ex)
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-600">Loading program data...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-gray-600">Program not found</p>
      </div>
    );
  }
return (
  <div className="app-container">
    <ToastContainer />
    <header className="patient-header">
      <div className="patient-header-content">
        <button onClick={() => router.push('/patients')} className="back-button">
          <ChevronLeft className="icon-sm" />
          Back to programs
        </button>          
        <div className="patient-header-main">
          <div className="patient-header-avatar">
            {program.patient_name ? getInitials(program.patient_name) : 'UN'}
          </div>
          <div className="patient-header-info">
            <h1 className="patient-header-name">
              {program.patient_name || 'Unnamed Patient'}
            </h1>
            <p className="patient-header-meta">
              Code: {program.access_code} • Created: {new Date(program.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </header>

    <main className="content-wrapper">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Exercises</span>
            <Activity className="icon-sm" style={{ color: '#94a3b8' }} />
          </div>
          <div className="stat-card-value compliance-high">
            {exercises.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Access Code</span>
            <TrendingUp className="icon-sm" style={{ color: '#94a3b8' }} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
            {program.access_code}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Last Accessed</span>
            <Clock className="icon-sm" style={{ color: '#94a3b8' }} />
          </div>
          <div className="stat-card-value" style={{ fontSize: '1rem' }}>
            {program.last_accessed 
              ? new Date(program.last_accessed).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      {/* Exercise Program */}
      <section className="exercise-section">
        {/* Header with Edit/Save buttons */}
        <div className="exercise-header">
          <h2 className="exercise-title">Exercise Program</h2>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4" />
              Edit Program
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProgram}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setExercises(program?.exercises || []);
                  setIsEditMode(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Add Exercise button (only in edit mode) */}
        {isEditMode && (
          <button
            onClick={handleAddExercise}
            className="flex items-center gap-2 px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        )}

        {/* Exercise List */}
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No exercises in this program yet.</p>
          </div>
        ) : (
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <article key={index} className={`exercise-item ${isEditMode ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
                <div className="exercise-content">
                  <div className="exercise-details">
                    {/* Exercise Name */}
                    {isEditMode ? (
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        className="exercise-name-input"
                        placeholder="Exercise name"
                      />
                    ) : (
                      <h3 className="exercise-name">{exercise.name}</h3>
                    )}

                    {/* Sets & Reps */}
                    <div className="exercise-params">
                      <div className="param-group">
                        <label className="exercise-notes-label">Sets</label>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                            className="param-input"
                            disabled={false}
                          />
                        ) : (
                          <span className="param-value">{exercise.sets}</span>
                        )}
                      </div>
                      <div className="param-group">
                        <label className="exercise-notes-label">Reps</label>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                            className="param-input"
                            disabled={false}
                          />
                        ) : (
                          <span className="param-value">{exercise.reps}</span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="exercise-notes-label">Notes</label>
                      {isEditMode ? (
                        <textarea
                          value={exercise.notes}
                          onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                          className="exercise-notes-input"
                          rows={2}
                          placeholder="Exercise notes"
                          disabled={false}
                        />
                      ) : (
                        <p className="exercise-notes">{exercise.notes || 'No notes'}</p>
                      )}
                    </div>

                    {/* Last Modified */}
                    <p className="exercise-modified">
                      Last modified: {new Date(program.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions - Delete button in edit mode */}
                  <div className="exercise-actions">
                    {isEditMode && (
                      <button
                        onClick={() => removeExercise(index)}
                        className="icon-button icon-button-cancel"
                        title="Delete Exercise"
                      >
                        <Trash2 className="icon-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Session History Section */}
      <section className="exercise-section mt-12">
        <div className="exercise-header">
          <h2 className="exercise-title">Session History</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last tracking synced: {sessions.length > 0 ? new Date(sessions[0].completed_at).toLocaleString() : 'No data'}</span>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tracking sessions recorded yet.</p>
            <p className="text-sm text-gray-400">Sessions from the Physalign tracking script will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Exercise</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Reps</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Quality</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-gray-100">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(session.completed_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {session.exercise_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{session.rep_count}</span>
                        <span className="text-xs text-gray-400">/ {session.target_reps}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              session.completion_percentage > 80 ? 'bg-green-500' : 
                              session.completion_percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${session.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {Math.round(session.completion_percentage)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <BarChart2 className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Performance Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Session Performance</h3>
                <p className="text-sm text-gray-500">{selectedSession.exercise_name} • {new Date(selectedSession.completed_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Form Accuracy</span>
                  <div className="text-3xl font-black text-blue-900 mt-1">{Math.round(selectedSession.completion_percentage)}%</div>
                </div>
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Avg ROM</span>
                  <div className="text-3xl font-black text-teal-900 mt-1">{selectedSession.average_rom ? `${Math.round(selectedSession.average_rom)}°` : '--'}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Stress Score</span>
                  <div className="text-3xl font-black text-purple-900 mt-1">{selectedSession.stress_score ? Math.round(selectedSession.stress_score) : '--'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    Session Recording
                  </h4>
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group relative">
                    {selectedSession.video_url ? (
                      <video 
                        src={selectedSession.video_url} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Recording not available for this session</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    Clinician Notes & Feedback
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[200px]">
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      {selectedSession.notes || "No automated notes available."}
                    </p>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Add Feedback</label>
                      <textarea 
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="Type notes for the patient's next session..."
                        rows={4}
                      />
                      <button className="mt-3 w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Save Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
)};