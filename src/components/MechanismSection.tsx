'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

export const MechanismSection: React.FC = () => {
  return (
    <section style={{ marginBottom: 48 }} id="mechanism">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          PROTOCOL MECHANICS
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Capital Today · Automated Fees Tomorrow
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, maxWidth: 640 }}>
          Launch funding is backed by DEX Screener fast-track requests. Future Pons V2 creator fees are programmatically routed through a FinanceSplitter until the 1.20x lender cap is reached.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {/* Card 1: For Creators */}
        <article
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              For Creators
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Zap size={14} />
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
            Turn Momentum Into Upfront Budget
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Once a token demonstrates early trading activity, open a standardized $299 pool. Exchange a temporary 70% share of future creator fees to fund DEX Screener marketing and fast-track visibility.
          </p>

          <div
            style={{
              marginTop: 'auto',
              background: 'var(--surface-input)',
              border: '1px solid var(--line-soft)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: 'var(--ink)' }}>1. Live Pons Token</span>
              <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--lime)' }}>Launch Funding Request</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: 'var(--ink)' }}>2. 100% Target Met</span>
              <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--emerald)' }}>Campaign Paid Upfront</span>
            </div>
          </div>
        </article>

        {/* Card 2: For Lenders */}
        <article
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              For Lenders & Backers
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald)',
              }}
            >
              <ShieldCheck size={14} />
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
            Earn 1.20x Yield From Trading Fees
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Enter with pooled ETH (starting at just $10). Receive automatic 70% pro-rata distributions on every trade until your 1.20x fixed cap is satisfied. Recycle capital into fresh launches.
          </p>

          <div
            style={{
              marginTop: 'auto',
              background: 'var(--surface-input)',
              border: '1px solid var(--line-soft)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: 'var(--ink)' }}>1. Fund Pool with ETH</span>
              <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--emerald)' }}>70% Fee Streaming</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: 'var(--ink)' }}>2. 1.20x Cap Reached</span>
              <ArrowRight size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--lime)' }}>Fees Return to Creator</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
