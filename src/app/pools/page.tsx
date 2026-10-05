'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { GondiStatsBanner } from '@/components/GondiStatsBanner';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Users, Sparkles, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function LaunchPoolsPage() {
  const { deals, selectedDeal, setSelectedDealId, openContributionModal } = useMarket();

  const [activeTab, setActiveTab] = useState<'ALL' | 'HOT' | 'REPAYING' | 'REPAID'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'ETH' | 'USDC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [minVelocity, setMinVelocity] = useState(0);

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    if (activeTab === 'HOT' && deal.status !== 'HOT') return false;
    if (activeTab === 'REPAYING' && deal.status !== 'REPAYING') return false;
    if (activeTab === 'REPAID' && deal.status !== 'REPAID') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        deal.token.symbol.toLowerCase().includes(q) ||
        deal.token.name.toLowerCase().includes(q) ||
        deal.token.creatorAddress.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (deal.feeVelocity < minVelocity) return false;

    return true;
  });

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
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed">
        {/* Top Header & Stats matching Gondi Lending Market */}
        <GondiStatsBanner />

        {/* Subtabs matching Gondi: [All Pools] [Hot] [Repaying] [Repaid] */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Pools (${deals.length})` },
              { id: 'HOT', label: `Hot Funding (${deals.filter((d) => d.status === 'HOT').length})` },
              { id: 'REPAYING', label: `Repaying (${deals.filter((d) => d.status === 'REPAYING').length})` },
              { id: 'REPAID', label: `Repaid (${deals.filter((d) => d.status === 'REPAID').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === tab.id ? 'var(--ink)' : 'var(--soft)',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              width: 240,
            }}
          >
            <Search size={14} style={{ color: 'var(--muted)', marginRight: 8 }} />
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 0,
                outline: 'none',
                background: 'transparent',
                fontSize: 12,
                width: '100%',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>

        {/* Main Content Area: Left Filter Column + Right Table */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Left Filter Column matching Gondi screenshot 3 */}
          <aside
            style={{
              width: 220,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              boxShadow: '0 8px 24px rgba(20, 20, 15, 0.03)',
              flexShrink: 0,
              display: 'grid',
              gap: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Currency
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['ALL', 'ETH', 'USDC'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrencyFilter(curr)}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: 8,
                      background: currencyFilter === curr ? 'var(--ink)' : '#ffffff',
                      color: currencyFilter === curr ? '#ffffff' : 'var(--ink)',
                      border: '1px solid var(--line)',
                      fontSize: 11,
                      fontWeight: 750,
                      cursor: 'pointer',
                    }}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Fee Velocity Filter
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {[
                  { label: 'All Velocities', val: 0 },
                  { label: '> $20/hr', val: 20 },
                  { label: '> $50/hr', val: 50 },
                  { label: '> $70/hr', val: 70 },
                ].map((item) => (
                  <label
                    key={item.val}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="velocity"
                      checked={minVelocity === item.val}
                      onChange={() => setMinVelocity(item.val)}
                      style={{ accentColor: 'var(--ink)', cursor: 'pointer' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Split Guarantee
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                70% creator fees stream to lenders until 1.20x cap is met. Automatic smart contract return.
              </p>
            </div>
          </aside>

          {/* Central Pools Table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gondi-table-box">
              <div style={{ overflowX: 'auto' }}>
                <table className="gondi-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: 'center' }}>#</th>
                      <th>Token / Launch Pool</th>
                      <th style={{ textAlign: 'right' }}>Target (ETH)</th>
                      <th style={{ textAlign: 'right' }}>Raised (ETH)</th>
                      <th style={{ textAlign: 'right' }}>Fee Velocity</th>
                      <th style={{ textAlign: 'center' }}>Lender Share</th>
                      <th style={{ textAlign: 'center' }}>Repay Cap</th>
                      <th style={{ textAlign: 'center' }}>7D Trend</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((deal, index) => {
                      const targetEth = deal.campaignTargetUsd / ETH_PRICE_USD;
                      const raisedEth = deal.fundedUsd / ETH_PRICE_USD;
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
                          onClick={() => setSelectedDealId(deal.id)}
                          style={{
                            background: isSelected ? 'rgba(88, 201, 57, 0.08)' : undefined,
                          }}
                        >
                          <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                            {index + 1}
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {deal.token.imageUrl ? (
                                <img
                                  src={deal.token.imageUrl}
                                  alt={deal.token.name}
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    objectFit: 'cover',
                                    border: '1px solid var(--line-soft)',
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
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
                              )}
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

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                              {targetEth.toFixed(4)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                              ${deal.campaignTargetUsd}
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                              {raisedEth.toFixed(4)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                              {progressPercent}% target
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                              ${deal.feeVelocity}/hr
                            </div>
                            <div style={{ fontSize: 11, color: isPositiveChange ? 'var(--emerald)' : 'var(--coral)' }}>
                              +{deal.feeVelocityTrend}%
                            </div>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--ink)' }}>{deal.lenderFeeSharePct}%</span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span className="pill momentum" style={{ fontSize: 10 }}>
                              {deal.repayCapMultiplier.toFixed(2)}x
                            </span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            {renderSparkline(sparklinePoints, isPositiveChange)}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            {deal.status !== 'REPAID' && deal.fundedUsd < deal.campaignTargetUsd ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openContributionModal(deal);
                                }}
                                className="btn lime"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: 11.5,
                                  fontWeight: 850,
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
          </div>
        </div>
      </div>

      {/* Right Column: All Activity Live Feed */}
      <GondiActivityFeed />
    </div>
  );
}
