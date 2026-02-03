'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/dashboard/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    getSupabaseClient().auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        // If logged in, go to patients
        router.push('/dashboard/patients');
      } else {
        // If not logged in, go to sign in
        router.push('/signin');
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return null;
}