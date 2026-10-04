'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="wrap foot-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="mark" style={{ width: 20, height: 20, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Launch Funding Market</span>
          <span>·</span>
          <span>Robinhood Chain Testnet (ID 46630)</span>
        </div>

        <div style={{ display: 'flex', gap: 20, color: 'var(--muted)' }}>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/creator">For Creators</Link>
          <a
            href="https://github.com/ponsdotdev"
            target="_blank"
            rel="noreferrer"
          >
            Pons V2 Contracts
          </a>
          <a
            href="https://robinhoodchain.blockscout.com"
            target="_blank"
            rel="noreferrer"
          >
            Explorer
          </a>
        </div>

        <div>
          <span>Concept UI only · Prototype version · No live funds</span>
        </div>
      </div>
    </footer>
  );
};
