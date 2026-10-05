'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { ChevronLeft, ChevronRight, Info, Play, Pause } from 'lucide-react';

export const GondiCarousel: React.FC = () => {
  const router = useRouter();
  const { deals, openContributionModal, setSelectedDealId } = useMarket();
  const [filter, setFilter] = useState<'All' | 'Hot' | 'Near Cap' | 'Repaying'>('All');
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Refs so the rAF loop never restarts on hover toggle (restart = jump/reset feel)
  const pausedRef = useRef(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'Hot') return deal.status === 'HOT' || deal.fundedUsd / deal.campaignTargetUsd > 0.6;
    if (filter === 'Near Cap') return deal.status === 'REPAYING' || deal.fundedUsd / deal.campaignTargetUsd >= 0.8;
    if (filter === 'Repaying') return deal.status === 'REPAYING' || deal.status === 'REPAID';
    return true;
  });

  // Ensure enough items so continuous wrap is seamless without empty gaps
  const baseDeals = [...filteredDeals];
  while (baseDeals.length > 0 && baseDeals.length < 5) {
    baseDeals.push(...filteredDeals);
  }
  const displayDeals = baseDeals.length > 0 ? [...baseDeals, ...baseDeals] : [];

  // Reset scroll position when filter changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [filter]);

  // Smooth continuous auto-scroll (marquee ticker) via single requestAnimationFrame loop.
  // Loop is mounted once per dataset — hover/pause only flips refs, never restarts the loop,
  // so there is no jump/reset when cursor enters/leaves.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || displayDeals.length === 0) return;

    let animId: number;
    let lastTime = performance.now();
    // Gentle ticker speed (~32 pixels per second)
    const speed = 32;
    const GAP = 16; // must match flex gap in style/class

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!pausedRef.current && !hoveredRef.current && container) {
        // stride = width of exactly one set (n cards + n gaps).
        // scrollWidth/2 = n*W + (n-0.5)*gap, so add half a gap to land pixel-perfect.
        const halfWidth = container.scrollWidth / 2;
        const stride = halfWidth + GAP / 2;
        if (halfWidth > 0 && container.scrollWidth > container.clientWidth) {
          container.scrollLeft += speed * delta;
          // Seamless infinite wrap around
          if (container.scrollLeft >= stride) {
            container.scrollLeft -= stride;
          }
        }
      } else {
        // Keep clock in sync while paused so resume has no delta jump
        lastTime = now;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayDeals.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const GAP = 16;
      const stride = container.scrollWidth / 2 + GAP / 2;
      const scrollAmount = 260 * 2;

      if (direction === 'left') {
        if (container.scrollLeft <= 10 && stride > 0) {
          container.scrollLeft += stride;
        }
        container.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth',
        });
      } else {
        if (container.scrollLeft >= stride && stride > 0) {
          container.scrollLeft -= stride;
        }
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  };

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

        {/* Carousel Nav Arrows & Auto-scroll Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            title={isPaused ? "Play auto-scroll marquee" : "Pause auto-scroll marquee"}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 'var(--radius-full)',
              background: isPaused ? 'var(--soft)' : '#ffffff',
              border: '1px solid var(--line)',
              color: isPaused ? 'var(--muted)' : 'var(--ink)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 750,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            <span>{isPaused ? 'Paused' : 'Auto-scroll'}</span>
          </button>

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
        className="gondi-carousel-cards is-autoscrolling"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}
      >
        {displayDeals.map((deal, idx) => {
          const targetEth = deal.campaignTargetUsd / ETH_PRICE_USD;
          const raisedEth = deal.fundedUsd / ETH_PRICE_USD;
          const progressPercent = Math.min(100, Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100));

          return (
            <div
              key={`${deal.id}-${idx}`}
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
                router.push(`/request/${deal.id}`);
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

                {deal.token.imageUrl ? (
                  <img
                    src={deal.token.imageUrl}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                ) : (
                  /* Fallback Big Token Symbol */
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
                )}

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
                    router.push(`/request/${deal.id}`);
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
