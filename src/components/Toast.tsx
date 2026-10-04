'use client';

import React from 'react';
import { useMarket } from '@/context/MarketContext';
import { CheckCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useMarket();

  if (!toastMessage) return null;

  return (
    <div className="toast-bar">
      <CheckCircle size={18} color="var(--lime)" />
      <span>{toastMessage}</span>
      <button
        type="button"
        onClick={clearToast}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 2,
          marginLeft: 8,
          display: 'grid',
          placeItems: 'center',
          opacity: 0.7,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
