import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import RecordExercise from '../app/record/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } }),
    },
  },
}));

describe('Record Exercise Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentExercise') {
        return JSON.stringify({
          name: 'Squats',
          sets: 3,
          reps: 10,
          notes: 'Keep your back straight'
        });
      }
      if (key === 'accessCode') {
        return 'TEST123';
      }
      return null;
    });
    mockRouter.push.mockClear();
  });

  test('loads exercise from sessionStorage', () => {
    render(<RecordExercise />);
    
    expect(screen.getByText('Squats')).toBeInTheDocument();
    expect(screen.getByText('3 sets × 10 reps')).toBeInTheDocument();
  });

  test('shows exercise instructions', () => {
    render(<RecordExercise />);
    
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('Keep your back straight')).toBeInTheDocument();
  });

  test('displays real-time metrics panel', async () => {
    render(<RecordExercise />);
    
    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Rep count
    });
    
    // Should show metrics cards
    expect(screen.getByText('Repetitions')).toBeInTheDocument();
    expect(screen.getByText('Form Quality')).toBeInTheDocument();
    expect(screen.getByText('Current Feedback')).toBeInTheDocument();
  });

  test('handles exercise cancellation', () => {
    render(<RecordExercise />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/exercises');
  });

  test('initializes with correct state', () => {
    render(<RecordExercise />);
    
    // Should show initial metrics
    expect(screen.getByText('0')).toBeInTheDocument(); // Rep count
    expect(screen.getByText('100%')).toBeInTheDocument(); // Quality
    expect(screen.getByText('Stand in frame')).toBeInTheDocument(); // Feedback
  });
});

describe('Exercise Session Flow', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'currentExercise') {
        return JSON.stringify({
          name: 'Shoulder Raises',
          sets: 2,
          reps: 15,
          notes: 'Raise arms to shoulder height'
        });
      }
      if (key === 'accessCode') {
        return 'TEST456';
      }
      return null;
    });
  });

  test('tracks different exercise types', () => {
    render(<RecordExercise />);
    
    expect(screen.getByText('Shoulder Raises')).toBeInTheDocument();
    expect(screen.getByText('2 sets × 15 reps')).toBeInTheDocument();
  });

  test('maintains session metrics', async () => {
    render(<RecordExercise />);
    
    // Simulate exercise progression
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Should track multiple metrics
    expect(screen.getByText('Repetitions')).toBeInTheDocument();
    expect(screen.getByText('Form Quality')).toBeInTheDocument();
  });
});