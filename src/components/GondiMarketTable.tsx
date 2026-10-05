'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { FundingDeal } from '@/types/market';
import { Info, ArrowUpRight, ArrowDownRight, Users, Calculator, ExternalLink, RefreshCw } from 'lucide-react';
import { PaybackCalculatorModal } from '@/components/PaybackCalculatorModal';

export const GondiMarketTable: React.FC = () => {
  const { deals, selectedDeal, setSelectedDealId, openContributionModal } = useMarket();

  // Mode: Pons Pools vs Live Gondi NFT Collections
  const [marketMode, setMarketMode] = useState<'pons' | 'gondi'>('pons');
  const [gondiCollections, setGondiCollections] = useState<any[]>([]);
  const [isGondiLoading, setIsGondiLoading] = useState<boolean>(false);
  const [calcDeal, setCalcDeal] = useState<FundingDeal | null>(null);

  const [activeTab, setActiveTab] = useState<'Top' | 'Volume' | 'Movers'>('Top');
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');

  // Fetch live collections from Gondi GraphQL route
  const fetchGondiLive = () => {
    setIsGondiLoading(true);
    fetch('/api/gondi?limit=15')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.collections) {
          setGondiCollections(data.collections);
        }
      })
      .catch((err) => console.error('Error fetching live Gondi:', err))
      .finally(() => setIsGondiLoading(false));
  };

  useEffect(() => {
    if (marketMode === 'gondi' && gondiCollections.length === 0) {
      fetchGondiLive();
    }
  }, [marketMode]);

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
      <div className="gondi-table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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

          {/* Mode Switcher: Pons Pools vs Live Gondi GraphQL */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--soft)',
              padding: 3,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--line-soft)',
            }}
          >
            <button
              type="button"
              onClick={() => setMarketMode('pons')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: marketMode === 'pons' ? '#ffffff' : 'transparent',
                fontWeight: 800,
                fontSize: 11.5,
                color: marketMode === 'pons' ? 'var(--ink)' : 'var(--muted)',
                border: marketMode === 'pons' ? '1px solid var(--line)' : 'none',
                boxShadow: marketMode === 'pons' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🌱 Pons Launch Pools
            </button>
            <button
              type="button"
              onClick={() => setMarketMode('gondi')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: marketMode === 'gondi' ? '#ffffff' : 'transparent',
                fontWeight: 800,
                fontSize: 11.5,
                color: marketMode === 'gondi' ? 'var(--ink)' : 'var(--muted)',
                border: marketMode === 'gondi' ? '1px solid var(--line)' : 'none',
                boxShadow: marketMode === 'gondi' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <span>⚡ Live Gondi Collections</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 900,
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                API
              </span>
            </button>
          </div>
        </div>

        {/* Right Tab Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {marketMode === 'pons' ? (
            <>
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
                <span>All Pools</span>
                <span>→</span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={fetchGondiLive}
              disabled={isGondiLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: 11.5,
                fontWeight: 750,
                border: '1px solid var(--line)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} className={isGondiLoading ? 'animate-spin' : ''} />
              <span>{isGondiLoading ? 'Syncing...' : 'Sync api2.gondi.xyz'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        {marketMode === 'pons' ? (
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
                      cursor: 'pointer',
                      background: isSelected ? 'var(--soft)' : undefined,
                    }}
                  >
                    {/* Index */}
                    <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                      {index + 1}
                    </td>

                    {/* Token / Launch Pool */}
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
                                  : 'hot'
                              }`}
                            >
                              {deal.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                            {deal.token.symbol} · by {deal.token.creatorAddress}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Target (ETH) */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        {targetEth.toFixed(4)} ETH
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        ${deal.campaignTargetUsd}
                      </div>
                    </td>

                    {/* 24H Change */}
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 12.5,
                          color: isPositiveChange ? 'var(--emerald)' : 'var(--coral)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        {isPositiveChange ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{deal.feeVelocityTrend > 0 ? '+' : ''}{deal.feeVelocityTrend}%</span>
                      </div>
                    </td>

                    {/* Raised (ETH) */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        {raisedEth.toFixed(4)} ETH
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {progressPercent}% target
                      </div>
                    </td>

                    {/* Fees Accrued */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        {(deal.creatorFeesAccruedUsd / ETH_PRICE_USD).toFixed(4)} ETH
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCalcDeal(deal);
                          }}
                          title="Simulate 1.20x Payback & Yield"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: 'var(--soft)',
                            border: '1px solid var(--line)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--ink)',
                          }}
                        >
                          <Calculator size={13} />
                        </button>

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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Live Gondi Collections Table */
          <table className="gondi-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>#</th>
                <th>Gondi NFT Collection</th>
                <th style={{ textAlign: 'right' }}>Floor Price</th>
                <th style={{ textAlign: 'center' }}>Total Items</th>
                <th style={{ textAlign: 'center' }}>Active Loans on Gondi</th>
                <th style={{ textAlign: 'right' }}>Repayment Rate</th>
                <th style={{ textAlign: 'right' }}>Gondi Source</th>
              </tr>
            </thead>
            <tbody>
              {isGondiLoading && gondiCollections.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Fetching live NFT collections from https://api2.gondi.xyz...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                gondiCollections.map((col, idx) => (
                  <tr key={col.id || idx}>
                    <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                      {idx + 1}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {col.imageUrl ? (
                          <img
                            src={col.imageUrl}
                            alt={col.name}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              objectFit: 'cover',
                              border: '1px solid var(--line-soft)',
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
                            }}
                          >
                            NFT
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                            {col.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                            slug: {col.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        {col.floorPriceEth > 0 ? `${col.floorPriceEth} ETH` : 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        ${col.floorPriceUsd.toLocaleString()}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 12.5 }}>
                        {col.nftsCount ? col.nftsCount.toLocaleString() : '—'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'var(--soft)',
                          fontSize: 12,
                          fontWeight: 800,
                          color: 'var(--ink)',
                        }}
                      >
                        <span>{col.activeLoansCount} Loans</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {col.repaymentRatePct !== null ? (
                        <div style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: 12.5 }}>
                          {col.repaymentRatePct}%
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <a
                        href={col.gondiUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          background: '#ffffff',
                          border: '1px solid var(--line)',
                          color: 'var(--ink)',
                          fontSize: 11.5,
                          fontWeight: 750,
                          textDecoration: 'none',
                        }}
                      >
                        <span>View Gondi</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Payback & ROI Simulator Modal */}
      <PaybackCalculatorModal
        deal={calcDeal}
        isOpen={!!calcDeal}
        onClose={() => setCalcDeal(null)}
        onOpenFundModal={openContributionModal}
      />
    </div>
  );
};
