'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { ArrowUpRight } from 'lucide-react';

export const GondiStatsBanner: React.FC = () => {
  const { deals } = useMarket();
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');

  const totalFundedUsd = deals.reduce((acc, d) => acc + d.fundedUsd, 0);
  const totalFundedEth = totalFundedUsd / ETH_PRICE_USD;

  const totalFeesDistributedUsd = deals.reduce((acc, d) => acc + d.creatorFeesAccruedUsd, 0);
  const totalFeesDistributedEth = totalFeesDistributedUsd / ETH_PRICE_USD;

  const activePoolsCount = deals.filter((d) => d.status === 'LIVE' || d.status === 'MOMENTUM' || d.status === 'HOT' || d.status === 'REPAYING').length;
  const nearCapCount = deals.filter((d) => d.status === 'REPAYING').length;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Top Title & Timeframe Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: 6,
            }}
          >
            Lending Market
          </h1>
          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--muted)',
              fontWeight: 500,
              maxWidth: 600,
            }}
          >
            Borrow campaign capital against future DEX fees, or earn 1.20x fixed yield backing token launches.
          </p>
        </div>

        {/* Timeframe Buttons [24H] [7D] [30D] */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-full)',
            padding: 3,
            gap: 2,
          }}
        >
          {(['24H', '7D', '30D'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? 'var(--surface-elevated)' : 'transparent',
                color: timeframe === tf ? '#ffffff' : 'var(--muted)',
                border: 0,
                borderRadius: 'var(--radius-full)',
                padding: '5px 14px',
                fontSize: 11.5,
                fontWeight: 750,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row (Gondi style 4-column layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {/* Metric 1: Capital Outstanding / Raised */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
            Capital deployed
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 4 }}>
            ${totalFundedUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{totalFundedEth.toFixed(4)} ETH</span>
            <span style={{ color: 'var(--emerald)' }}>▲ 100% Onchain</span>
          </div>
        </div>

        {/* Metric 2: Fees Distributed 24H */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
            Fees accrued {timeframe}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 4 }}>
            ${totalFeesDistributedUsd.toFixed(2)}
          </div>
          <div style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                color: 'var(--emerald)',
                fontWeight: 750,
              }}
            >
              <ArrowUpRight size={13} />
              +14.8%
            </span>
            <span style={{ color: 'var(--muted)' }}>vs prior {timeframe}</span>
          </div>
        </div>

        {/* Metric 3: Originated Pools */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
            Originated pools
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {deals.length} Launches
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            {activePoolsCount} active · {nearCapCount} repaying
          </div>
        </div>

        {/* Metric 4: Median Return Cap & Split */}
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
            Fixed return cap
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--lime)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            1.20x Cap
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>70% Lender Split</span>
            <span>•</span>
            <span>20.0% Fixed ROI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
