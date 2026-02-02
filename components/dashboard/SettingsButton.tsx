'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import SettingsModal from './SettingsModal';

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="settings-button"
        aria-label="Open settings"
      >
        <Settings className="icon-md" />
      </button>
      {isOpen && <SettingsModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
