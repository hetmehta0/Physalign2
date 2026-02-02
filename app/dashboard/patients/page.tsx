'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Activity, Calendar, TrendingUp, Plus, FileText, Clock, Filter, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/dashboard/supabase';
import { Program } from '@/lib/dashboard/types';
import MetricCard from '@/components/dashboard/MetricCard';



export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'accessed'>('created');
  const [filterAccessed, setFilterAccessed] = useState<'all' | 'never' | 'recent'>('all');
  const router = useRouter();

  useEffect(() => { 
    async function fetchPrograms() {
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

      // Fetch user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.display_name) {
        setUserName(profile.display_name);
      } else {
        // Fallback to email if no display name set
        setUserName(session.user.email?.split('@')[0] || 'Clinician');
      }

      const { data, error } = await supabase
        .from('exercise_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Handle error silently for production
      } else {
        setPrograms(data || []);
      }
      setLoading(false);
    }
    fetchPrograms();
  }, [router]);

  const filteredPrograms = programs.filter(p => {
    // Search by patient name
    const matchesSearch = p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by access status
    if (filterAccessed === 'never') {
      return matchesSearch && !p.last_accessed;
    } else if (filterAccessed === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && p.last_accessed && new Date(p.last_accessed) >= weekAgo;
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    // Sort programs
    if (sortBy === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'name') {
      const nameA = a.patient_name?.toLowerCase() || '';
      const nameB = b.patient_name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'accessed') {
      const timeA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0;
      const timeB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  const handleSelectProgram = (program: Program) => {
    localStorage.setItem('selectedProgram', JSON.stringify(program));
    router.push('/dashboard/trends');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Exercise Programs</h1>
            <p className="header-subtitle">Welcome back, {userName || 'Loading...'}</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Metrics Dashboard */}
        <div className="stats-grid mb-6">
          <MetricCard
            label="Total Programs"
            value={programs.length}
            icon={<FileText />}
            colorClass="compliance-high"
          />
          <MetricCard
            label="Created This Week"
            value={programs.filter(p => {
              const created = new Date(p.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return created >= weekAgo;
            }).length}
            icon={<Plus />}
          />
          <MetricCard
            label="Never Accessed"
            value={programs.filter(p => !p.last_accessed).length}
            icon={<Clock />}
          />
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-auto max-w-96">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterAccessed}
                onChange={(e) => setFilterAccessed(e.target.value as any)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors appearance-none pr-8"
              >
                <option value="all">All Programs</option>
                <option value="never">Never Accessed</option>
                <option value="recent">Recently Accessed</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors appearance-none pr-8"
              >
                <option value="created">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="accessed">Sort by Last Accessed</option>
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => router.push('/createProgram')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="icon-sm" />
              Create Program
            </button>
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs yet. Create your first one!</p>
          </div>
        ) : (
          <div className="patient-grid">
            {filteredPrograms.map(program => (
              <div
                key={program.id}
                onClick={() => handleSelectProgram(program)}
                className="patient-card"
              >
                <div className="patient-card-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <User className="icon-md" style={{ color: '#475569' }} />
                    </div>
                    <div>
                      <h3 className="patient-name">{program.patient_name || 'Unnamed Patient'}</h3>
                      <p className="patient-age">Code: {program.access_code}</p>
                    </div>
                  </div>
                  <span className="status-badge status-active">
                    Active
                  </span>
                </div>

                <div className="patient-stats">
                  <div className="stat-row">
                    <span className="stat-label">
                      <Calendar className="icon-sm" />
                      Created
                    </span>
                    <span className="stat-value">
                      {new Date(program.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <Activity className="icon-sm" />
                      Exercises
                    </span>
                    <span className="stat-value">
                      {program.exercises?.length || 0} exercises
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <TrendingUp className="icon-sm" />
                      Last Accessed
                    </span>
                    <span className="stat-value">
                      {program.last_accessed 
                        ? new Date(program.last_accessed).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}