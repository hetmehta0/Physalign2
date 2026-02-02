'use client';

import React, { useState } from 'react';

interface FatigueRatingProps {
  onFatigueChange: (level: number, notes: string) => void;
  initialValue?: number;
  initialNotes?: string;
}

export default function FatigueRating({ 
  onFatigueChange, 
  initialValue = 5, 
  initialNotes = '' 
}: FatigueRatingProps) {
  const [fatigueLevel, setFatigueLevel] = useState(initialValue);
  const [notes, setNotes] = useState(initialNotes);

  const handleLevelChange = (level: number) => {
    setFatigueLevel(level);
    onFatigueChange(level, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onFatigueChange(fatigueLevel, newNotes);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">How are you feeling?</h3>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Energy Level</span>
          <span className="text-sm text-gray-400">{fatigueLevel}/10</span>
        </div>
        
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                fatigueLevel === level
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-1 text-xs text-gray-500">
          <span>Exhausted</span>
          <span className="col-span-3 text-center">Moderate</span>
          <span className="text-right">Energetic</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="How do you feel physically? Any pain or discomfort?"
          className="w-full bg-gray-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          rows={3}
        />
      </div>
    </div>
  );
}