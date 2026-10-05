'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--bg)',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        fontSize: 12,
        color: 'var(--muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#58c939',
              boxShadow: '0 0 6px rgba(88, 201, 57, 0.6)',
            }}
          />
          <span style={{ fontWeight: 800, color: 'var(--ink)' }}>In Sync</span>
        </div>
        <span>•</span>
        <span>Robinhood Chain Testnet (46630)</span>
        <span>•</span>
        <a
          href="https://robinhoodchain.blockscout.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--muted)', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          Explorer
        </a>
        <span>•</span>
        <a
          href="https://github.com/wealthy-org/market"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--muted)', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          GitHub
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/portfolio"
          style={{ color: 'var(--muted)', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          Portfolio
        </Link>
        <Link
          href="/creator"
          style={{ color: 'var(--muted)', transition: 'color 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          For Creators
        </Link>
        <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
          ETH $2,500 · 1.20x Cap
        </span>
      </div>
    </footer>
  );
};
