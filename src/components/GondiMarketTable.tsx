'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { Info, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';

export const GondiMarketTable: React.FC = () => {
  const { deals, selectedDeal, setSelectedDealId, openContributionModal } = useMarket();

  const [activeTab, setActiveTab] = useState<'Top' | 'Volume' | 'Movers'>('Top');
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');

  // Sort deals based on activeTab
  const sortedDeals = [...deals].sort((a, b) => {
    if (activeTab === 'Volume') {
      return b.creatorFeesAccruedUsd - a.creatorFeesAccruedUsd;
    }
    if (activeTab === 'Movers') {
      return (b.fundedUsd / b.campaignTargetUsd) - (a.fundedUsd / a.campaignTargetUsd);
    }
    return b.fundedUsd - a.fundedUsd;
  });

  // Sparkline generator helper
  const renderSparkline = (points: number[], isPositive: boolean) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${coords.join(' L ')}`;
    const strokeColor = isPositive ? 'var(--emerald)' : 'var(--coral)';

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="gondi-table-box" style={{ marginBottom: 40 }} id="market">
      {/* Table Header Controls */}
      <div className="gondi-table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Market Overview
          </span>
          <span
            title="Real-time DEX Screener Fast-Track pools backed by Pons V2 creator fee splits"
            style={{ cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
          >
            <Info size={14} />
          </span>
        </div>

        {/* Right Tab Selectors [Top | Volume | Movers] + [24H | 7D | 30D] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="gondi-tabs">
            {(['Top', 'Volume', 'Movers'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`gondi-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="gondi-tabs">
            {(['24H', '7D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                className={`gondi-tab-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          <Link
            href="/pools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--soft)',
              color: 'var(--ink)',
              fontSize: 12,
              fontWeight: 800,
              textDecoration: 'none',
              border: '1px solid var(--line)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span>All Launch Pools</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table className="gondi-table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>#</th>
              <th>Token / Launch Pool</th>
              <th style={{ textAlign: 'right' }}>Target (ETH)</th>
              <th style={{ textAlign: 'right' }}>{timeframe} Change</th>
              <th style={{ textAlign: 'right' }}>Raised (ETH)</th>
              <th style={{ textAlign: 'right' }}>Fees Accrued</th>
              <th style={{ textAlign: 'center' }}>Lenders</th>
              <th style={{ textAlign: 'center' }}>7D Fee Trend</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedDeals.map((deal, index) => {
              const targetEth = deal.campaignTargetUsd / ETH_PRICE_USD;
              const raisedEth = deal.fundedUsd / ETH_PRICE_USD;
              const feesEth = deal.creatorFeesAccruedUsd / ETH_PRICE_USD;
              const progressPercent = Math.min(100, Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100));
              const isSelected = selectedDeal.id === deal.id;

              const sparklinePoints = [
                0.2,
                0.35 + (deal.creatorFeesAccruedUsd % 7) * 0.05,
                0.3 + (deal.fundedUsd % 5) * 0.08,
                0.55,
                0.45 + (index * 0.05),
                0.7 + (deal.creatorFeesAccruedUsd % 3) * 0.1,
                0.95,
              ];
              const isPositiveChange = deal.trendDirection === 'up';

              return (
                <tr
                  key={deal.id}
                  onClick={() => {
                    setSelectedDealId(deal.id);
                    const el = document.getElementById('deal-detail');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    background: isSelected ? 'rgba(88, 201, 57, 0.08)' : undefined,
                  }}
                >
                  {/* # */}
                  <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                    {index + 1}
                  </td>

                  {/* Token / Launch Pool */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: '#1a1b18',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {deal.token.symbol.replace('$', '').slice(0, 3)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                            {deal.token.name}
                          </span>
                          <span
                            className={`pill ${
                              deal.status === 'REPAID'
                                ? 'repaid'
                                : deal.status === 'REPAYING'
                                ? 'momentum'
                                : deal.status === 'HOT'
                                ? 'hot'
                                : ''
                            }`}
                            style={{ fontSize: 9.5, padding: '2px 7px' }}
                          >
                            {deal.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                          {deal.token.symbol} · by {deal.token.creatorAddress}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Target (ETH) */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                      {targetEth.toFixed(4)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      ${deal.campaignTargetUsd}
                    </div>
                  </td>

                  {/* 24H Change */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        fontWeight: 750,
                        color: isPositiveChange ? 'var(--emerald)' : 'var(--coral)',
                        fontSize: 12.5,
                      }}
                    >
                      {isPositiveChange ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>+{deal.feeVelocityTrend}%</span>
                    </div>
                  </td>

                  {/* Raised (ETH) */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                      {raisedEth.toFixed(4)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {progressPercent}% target
                    </div>
                  </td>

                  {/* Fees Accrued */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                      {feesEth.toFixed(4)} ETH
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      ${deal.creatorFeesAccruedUsd.toFixed(2)}
                    </div>
                  </td>

                  {/* Lenders */}
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--ink)',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      <Users size={13} style={{ color: 'var(--muted)' }} />
                      <span>{deal.uniqueTraders}</span>
                    </div>
                  </td>

                  {/* 7D Fee Trend (Sparkline) */}
                  <td style={{ textAlign: 'center' }}>
                    {renderSparkline(sparklinePoints, isPositiveChange)}
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    {deal.status !== 'REPAID' && deal.fundedUsd < deal.campaignTargetUsd ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openContributionModal(deal);
                        }}
                        className="btn dark"
                        style={{
                          padding: '6px 14px',
                          fontSize: 11.5,
                          fontWeight: 800,
                        }}
                      >
                        Fund
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDealId(deal.id);
                          const el = document.getElementById('deal-detail');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="btn"
                        style={{
                          padding: '6px 14px',
                          fontSize: 11.5,
                          fontWeight: 750,
                        }}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
