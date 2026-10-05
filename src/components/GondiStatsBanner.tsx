'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { ArrowUpRight } from 'lucide-react';

export const GondiStatsBanner: React.FC = () => {
  const { deals } = useMarket();
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');
  const [collapsed, setCollapsed] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  // Show the compact bar once the full metric cards have scrolled under the header
  useEffect(() => {
    const el = metricsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalFundedUsd = deals.reduce((acc, d) => acc + d.fundedUsd, 0);
  const totalFundedEth = totalFundedUsd / ETH_PRICE_USD;

  const totalFeesDistributedUsd = deals.reduce((acc, d) => acc + d.creatorFeesAccruedUsd, 0);
  const totalFeesDistributedEth = totalFeesDistributedUsd / ETH_PRICE_USD;

  const activePoolsCount = deals.filter((d) => d.status === 'LIVE' || d.status === 'MOMENTUM' || d.status === 'HOT' || d.status === 'REPAYING').length;
  const nearCapCount = deals.filter((d) => d.status === 'REPAYING').length;

  const compactStats = [
    { label: 'Deployed', value: `$${totalFundedUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
    { label: `Fees ${timeframe}`, value: `$${totalFeesDistributedUsd.toFixed(2)}`, accent: true },
    { label: 'Pools', value: `${deals.length}` },
    { label: 'Return cap', value: '1.20x' },
  ];

  return (
    <div style={{ display: 'contents' }}>
      {/* Compact sticky bar (zero-height anchor so it sticks across the whole page) */}
      <div style={{ position: 'sticky', top: 'var(--header-height)', height: 0, zIndex: 80 }}>
        <div
          aria-hidden={!collapsed}
          style={{
            position: 'absolute',
            top: 0,
            left: -28,
            right: -28,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '0 28px',
            background: 'rgba(251, 250, 246, 0.94)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--line)',
            opacity: collapsed ? 1 : 0,
            transform: collapsed ? 'translateY(0)' : 'translateY(-8px)',
            pointerEvents: collapsed ? 'auto' : 'none',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
              Lending Market
            </span>
            {compactStats.map((s) => (
              <span key={s.label} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.accent ? 'var(--emerald)' : 'var(--ink)' }}>
                  {s.value}
                </span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-full)', padding: 2, gap: 2, flexShrink: 0 }}>
            {(['24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? 'var(--ink)' : 'transparent',
                  color: timeframe === tf ? '#ffffff' : 'var(--muted)',
                  border: 0,
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 11px',
                  fontSize: 11,
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Title & Timeframe Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '34px',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              color: 'var(--ink)',
              marginBottom: 4,
            }}
          >
            Lending Market
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--muted)',
              fontWeight: 500,
              maxWidth: 620,
            }}
          >
            Borrow campaign capital against future DEX fees, or earn 1.20x fixed yield backing token launches.
          </p>
        </div>

        {/* Timeframe Buttons [24H] [7D] [30D] */}
        <div
          style={{
            display: 'flex',
            background: 'var(--soft)',
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
                background: timeframe === tf ? 'var(--ink)' : 'transparent',
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

      {/* Metrics Row (Prototype Paper Card Layout) */}
      <div
        ref={metricsRef}
        style={{
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {/* Metric 1: Capital Outstanding / Raised */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 8px 24px rgba(20, 20, 15, 0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Capital deployed
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              marginBottom: 4,
            }}
          >
            ${totalFundedUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{totalFundedEth.toFixed(4)} ETH</span>
            <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>• 100% Onchain</span>
          </div>
        </div>

        {/* Metric 2: Fees Distributed 24H */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 8px 24px rgba(20, 20, 15, 0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Fees accrued {timeframe}
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              marginBottom: 4,
            }}
          >
            ${totalFeesDistributedUsd.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
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
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 8px 24px rgba(20, 20, 15, 0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Originated pools
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              marginBottom: 4,
            }}
          >
            {deals.length} Launches
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {activePoolsCount} active · {nearCapCount} repaying
          </div>
        </div>

        {/* Metric 4: Median Return Cap & Split */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 8px 24px rgba(20, 20, 15, 0.04)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Fixed return cap
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              marginBottom: 4,
            }}
          >
            1.20x Cap
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ink)', fontWeight: 700 }}>75% Lender Split</span>
            <span>•</span>
            <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>20% ROI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
