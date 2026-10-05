'use client';

import React, { useRef, useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

export const GondiCarousel: React.FC = () => {
  const { deals, openContributionModal, setSelectedDealId } = useMarket();
  const [filter, setFilter] = useState<'All' | 'Hot' | 'Near Cap' | 'Repaying'>('All');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260 * 2;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'Hot') return deal.status === 'HOT' || deal.fundedUsd / deal.campaignTargetUsd > 0.6;
    if (filter === 'Near Cap') return deal.status === 'REPAYING' || deal.fundedUsd / deal.campaignTargetUsd >= 0.8;
    if (filter === 'Repaying') return deal.status === 'REPAYING' || deal.status === 'REPAID';
    return true;
  });

  return (
    <div className="gondi-carousel-wrapper" style={{ marginBottom: 36 }}>
      {/* Header with Title, Filter Pills, and Carousel Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Featured Launch Pools
            </span>
            <span
              title="Curated launch funding requests backed by Pons V2 creator fees"
              style={{ cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
            >
              <Info size={14} />
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['All', 'Hot', 'Near Cap', 'Repaying'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--ink)' : 'var(--soft)',
                  color: filter === f ? '#ffffff' : 'var(--muted)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: 11.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Nav Arrows */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="gondi-carousel-cards"
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}
      >
        {filteredDeals.map((deal) => {
          const targetEth = deal.campaignTargetUsd / ETH_PRICE_USD;
          const raisedEth = deal.fundedUsd / ETH_PRICE_USD;
          const progressPercent = Math.min(100, Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100));

          return (
            <div
              key={deal.id}
              className="gondi-pool-card"
              style={{
                flex: '0 0 230px',
                scrollSnapAlign: 'start',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(20, 20, 15, 0.04)',
                transition: 'transform 0.18s ease, border-color 0.18s ease',
              }}
              onClick={() => {
                setSelectedDealId(deal.id);
                const el = document.getElementById('deal-detail');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {/* Visual preview */}
              <div
                style={{
                  width: '100%',
                  height: 170,
                  borderRadius: 12,
                  background: '#1a1b18',
                  border: '1px solid var(--line-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: 12,
                  overflow: 'hidden',
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 10,
                    fontWeight: 800,
                    background:
                      deal.status === 'REPAID'
                        ? '#eef8e9'
                        : deal.status === 'REPAYING'
                        ? 'rgba(167, 255, 99, 0.2)'
                        : 'rgba(255, 255, 255, 0.18)',
                    color:
                      deal.status === 'REPAID'
                        ? '#40792c'
                        : deal.status === 'REPAYING'
                        ? 'var(--lime)'
                        : '#ffffff',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {deal.status === 'REPAID' ? 'REPAID' : deal.status === 'REPAYING' ? 'REPAYING' : `${progressPercent}%`}
                </div>

                {/* Big Token Symbol */}
                <div
                  style={{
                    fontSize: 38,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: 'var(--lime)',
                    opacity: 0.95,
                    textShadow: '0 0 24px rgba(167, 255, 99, 0.3)',
                  }}
                >
                  {deal.token.symbol.replace('$', '').slice(0, 4)}
                </div>

                {/* Progress bar inside card bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: deal.status === 'REPAID' ? '#58c939' : 'var(--lime)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Title & Creator */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 2,
                  }}
                >
                  {deal.token.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {deal.token.symbol} · by {deal.token.creatorAddress}
                </div>
              </div>

              {/* Dual Price Stack */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)' }}>
                    {targetEth.toFixed(3)} <span style={{ fontSize: 10, color: 'var(--muted)' }}>ETH</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Raised
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--emerald)' }}>
                    {raisedEth.toFixed(3)} <span style={{ fontSize: 10, color: 'var(--muted)' }}>ETH</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {deal.status !== 'REPAID' && deal.fundedUsd < deal.campaignTargetUsd ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openContributionModal(deal);
                  }}
                  className="btn lime"
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  Fund Pool
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
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12,
                    fontWeight: 750,
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
