'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessCodeEntry() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Fetch program from FastAPI
      const response = await fetch(`http://localhost:8000/api/program/${accessCode}`);
      
      if (!response.ok) {
        throw new Error('Invalid access code');
      }

      const data = await response.json();
      
      // Store program in sessionStorage (API returns program data directly, not wrapped in 'data' object)
      sessionStorage.setItem('accessCode', accessCode);
      // Clean and stringify the data to avoid parsing issues
      sessionStorage.setItem('program', JSON.stringify(data));
      
      // Navigate to exercises page
      router.push('/patient/exercises');
    } catch (err) {
      setError('Invalid access code. Please check with your physiotherapist.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Physalign</h1>
          <p className="text-gray-600">Enter your access code to begin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="abc123x"
                maxLength={7}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-wider focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || accessCode.length < 7}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don't have an access code?<br />
              Contact your physiotherapist.
            </p>
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clinician Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
