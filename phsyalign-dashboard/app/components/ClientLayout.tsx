'use client';

import SettingsButton from './SettingsButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      {children}
      <SettingsButton />
    </div>
  );
}
