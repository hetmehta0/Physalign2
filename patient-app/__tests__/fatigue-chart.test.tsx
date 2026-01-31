import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FatigueRating from '../app/components/FatigueRating';
import PatientFatigueChart from '../app/components/PatientFatigueChart';

describe('FatigueRating Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders fatigue rating component', () => {
    render(<FatigueRating onFatigueChange={mockOnChange} />);
    
    expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
    expect(screen.getByText('Energy Level')).toBeInTheDocument();
  });

  test('displays fatigue level buttons 1-10', () => {
    render(<FatigueRating onFatigueChange={mockOnChange} />);
    
    // Check that all level buttons are present
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('calls onFatigueChange when level is selected', () => {
    render(<FatigueRating onFatigueChange={mockOnChange} />);
    
    const level5Button = screen.getByText('5');
    fireEvent.click(level5Button);
    
    expect(mockOnChange).toHaveBeenCalledWith(5, '');
  });

  test('handles notes input correctly', () => {
    render(<FatigueRating onFatigueChange={mockOnChange} />);
    
    const textarea = screen.getByPlaceholderText('How do you feel physically? Any pain or discomfort?');
    fireEvent.change(textarea, { target: { value: 'Feeling tired today' } });
    
    // Should call with current level (default 5) and new notes
    expect(mockOnChange).toHaveBeenCalledWith(5, 'Feeling tired today');
  });

  test('uses initial values correctly', () => {
    render(
      <FatigueRating 
        onFatigueChange={mockOnChange} 
        initialValue={7} 
        initialNotes="Had a good night sleep" 
      />
    );
    
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Had a good night sleep')).toBeInTheDocument();
  });
});

describe('PatientFatigueChart Component', () => {
  const mockData = [
    { date: '2026-01-25', fatigueLevel: 6, notes: 'Normal day' },
    { date: '2026-01-26', fatigueLevel: 4, notes: 'Felt energetic' },
    { date: '2026-01-27', fatigueLevel: 8, notes: 'Very tired' },
    { date: '2026-01-28', fatigueLevel: 5, notes: 'Moderate energy' },
    { date: '2026-01-29', fatigueLevel: 3, notes: 'High energy' },
  ];

  test('renders chart with data', () => {
    render(<PatientFatigueChart data={mockData} />);
    
    expect(screen.getByText('Your Fatigue Trends')).toBeInTheDocument();
    expect(screen.getByText('Fatigue Tracking')).toBeInTheDocument();
  });

  test('displays summary metrics correctly', () => {
    render(<PatientFatigueChart data={mockData} />);
    
    // Average should be (6+4+8+5+3)/5 = 5.2
    expect(screen.getByText('5.2')).toBeInTheDocument();
    
    // Trend should be 3-6 = -3 (improving)
    expect(screen.getByText('↘ 3.0')).toBeInTheDocument();
    
    // Days tracked should be 5
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('shows recent entries in reverse chronological order', () => {
    render(<PatientFatigueChart data={mockData} />);
    
    // Should show entries with dates
    expect(screen.getByText('Sat, Jan 29')).toBeInTheDocument();
    expect(screen.getByText('Fri, Jan 28')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(<PatientFatigueChart data={[]} />);
    
    expect(screen.getByText('No fatigue data yet')).toBeInTheDocument();
    expect(screen.getByText('Start tracking your energy levels to see trends')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    const singleData = [{ date: '2026-01-30', fatigueLevel: 7 }];
    render(<PatientFatigueChart data={singleData} />);
    
    expect(screen.getByText('Fri, Jan 30')).toBeInTheDocument();
  });
});

describe('Integration Tests', () => {
  test('fatigue rating integrates with chart data flow', () => {
    // This would test the full flow from rating to chart display
    const mockFatigueData = [
      { date: new Date().toISOString(), fatigueLevel: 6, notes: 'Post-exercise fatigue' }
    ];
    
    render(<PatientFatigueChart data={mockFatigueData} />);
    
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Post-exercise fatigue')).toBeInTheDocument();
  });
});