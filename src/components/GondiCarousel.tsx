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
            <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              PONS Featured Listings
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
                  background: filter === f ? '#ffffff' : 'var(--surface)',
                  color: filter === f ? '#0e1113' : 'var(--muted)',
                  border: '1px solid',
                  borderColor: filter === f ? '#ffffff' : 'var(--line)',
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
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
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
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
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
                background: 'var(--surface-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
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
                  height: 180,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #18231c 0%, #111417 100%)',
                  border: '1px solid var(--line)',
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
                        ? 'rgba(167, 255, 99, 0.2)'
                        : deal.status === 'REPAYING'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(255, 255, 255, 0.15)',
                    color:
                      deal.status === 'REPAID'
                        ? 'var(--lime)'
                        : deal.status === 'REPAYING'
                        ? 'var(--emerald)'
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
                    opacity: 0.9,
                    textShadow: '0 0 30px rgba(167, 255, 99, 0.25)',
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
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: deal.status === 'REPAID' ? 'var(--lime)' : 'var(--emerald)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Title & Creator */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: '#ffffff',
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
                    fontSize: 11,
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
                  background: 'var(--surface-input)',
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Target
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                    {targetEth.toFixed(3)} <span style={{ fontSize: 9.5, color: 'var(--muted)' }}>ETH</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Raised
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--emerald)' }}>
                    {raisedEth.toFixed(3)} <span style={{ fontSize: 9.5, color: 'var(--muted)' }}>ETH</span>
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
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: '#ffffff',
                    color: '#0e1113',
                    border: 0,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
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
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-elevated)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    fontSize: 12,
                    fontWeight: 750,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-elevated)')}
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
