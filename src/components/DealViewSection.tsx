'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import confetti from 'canvas-confetti';
import { ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DealViewSection: React.FC = () => {
  const { selectedDeal, contributeToPool } = useMarket();
  const [allocationAmount, setAllocationAmount] = useState<number>(25);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const remainingFunding = Math.max(
    0,
    selectedDeal.campaignTargetUsd - selectedDeal.fundedUsd
  );

  const handleFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (allocationAmount <= 0) return;

    const result = contributeToPool(selectedDeal.id, allocationAmount);
    if (result.success) {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#a7ff63', '#11120f', '#eef8e9', '#58c939'],
        });
      } catch {
        // optional confetti
      }
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  const poolOwnershipPct = +(
    (allocationAmount / selectedDeal.campaignTargetUsd) *
    100
  ).toFixed(2);
  const maxRepaymentUsd = +(
    allocationAmount * selectedDeal.repayCapMultiplier
  ).toFixed(2);
  const ethEquivalent = +(allocationAmount / ETH_PRICE_USD).toFixed(4);

  return (
    <section style={{ marginBottom: 48 }} id="deal-detail">
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          03 / Deal view
        </div>
        <h2 className="serif-heading" style={{ fontSize: 28, color: 'var(--ink)' }}>
          See the cash flow, not just the market cap.
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4, maxWidth: 640 }}>
          Market cap is context. Fee velocity, liquidity, trader activity, and repayment terms define the financing opportunity on Pons V2.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {/* Left Panel: Token Details & Chart */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            boxShadow: '0 10px 30px rgba(20, 20, 15, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {selectedDeal.token.imageUrl ? (
                <img
                  src={selectedDeal.token.imageUrl}
                  alt={selectedDeal.token.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    objectFit: 'cover',
                    background: '#1a1b18',
                    border: '1px solid var(--line)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: '#1a1b18',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {selectedDeal.token.symbol.replace('$', '').slice(0, 3)}
                </div>
              )}
              <div>
                <b style={{ fontSize: 18, color: 'var(--ink)', display: 'block' }}>{selectedDeal.token.name}</b>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {selectedDeal.token.symbol} · {selectedDeal.token.age} old · by {selectedDeal.token.creatorAddress}
                </span>
              </div>
            </div>
            <div
              className={`pill ${
                selectedDeal.status === 'REPAID'
                  ? 'repaid'
                  : selectedDeal.status === 'REPAYING'
                  ? 'momentum'
                  : 'hot'
              }`}
            >
              {selectedDeal.status}
            </div>
          </div>

          <div style={{ marginTop: 22, marginBottom: 6 }}>
            <h3 className="serif-heading" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 4 }}>
              Fee velocity
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 42, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em' }}>
                ${selectedDeal.feeVelocity}
              </b>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                / hour ·{' '}
                <span
                  style={{
                    color: selectedDeal.trendDirection === 'up' ? 'var(--emerald)' : 'var(--coral)',
                    fontWeight: 750,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {selectedDeal.feeVelocityTrend > 0 ? '+' : ''}
                  {selectedDeal.feeVelocityTrend}% vs prior hour
                  {selectedDeal.trendDirection === 'up' ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                </span>
              </span>
            </div>
          </div>

          {/* Cash Flow SVG Chart matching prototype */}
          <div
            style={{
              height: 140,
              width: '100%',
              margin: '14px 0',
              borderRadius: 16,
              background: 'repeating-linear-gradient(to right, transparent 0 59px, rgba(0,0,0,.03) 60px), repeating-linear-gradient(to top, transparent 0 41px, rgba(0,0,0,.03) 42px), linear-gradient(to top, rgba(167,255,99,.15), transparent)',
              border: '1px solid var(--line-soft)',
              padding: 10,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg viewBox="0 0 600 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path
                d="M0,100 C70,95 90,75 145,80 C205,85 225,60 290,65 C360,70 385,45 450,48 C510,50 540,30 600,22"
                fill="none"
                stroke="#11120f"
                strokeWidth="3"
              />
              <path
                d="M0,100 C70,95 90,75 145,80 C205,85 225,60 290,65 C360,70 385,45 450,48 C510,50 540,30 600,22 L600,120 L0,120Z"
                fill="rgba(167, 255, 99, 0.22)"
              />
            </svg>
          </div>

          {/* Metrics grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            <div style={{ background: '#f5f4ef', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 12 }}>
              <span style={{ fontSize: 9.5, color: 'var(--muted)', display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Creator fees</span>
              <b style={{ fontSize: 15, color: 'var(--ink)' }}>${selectedDeal.creatorFeesAccruedUsd.toFixed(2)}</b>
            </div>
            <div style={{ background: '#f5f4ef', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 12 }}>
              <span style={{ fontSize: 9.5, color: 'var(--muted)', display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Liquidity</span>
              <b style={{ fontSize: 15, color: 'var(--ink)' }}>${(selectedDeal.liquidityUsd / 1000).toFixed(1)}K</b>
            </div>
            <div style={{ background: '#f5f4ef', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 12 }}>
              <span style={{ fontSize: 9.5, color: 'var(--muted)', display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Market Cap</span>
              <b style={{ fontSize: 15, color: 'var(--ink)' }}>${(selectedDeal.marketCapUsd / 1000).toFixed(1)}K</b>
            </div>
          </div>
        </div>

        {/* Right Panel: Funding Terms & Interactive Input */}
        <aside
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            boxShadow: '0 10px 30px rgba(20, 20, 15, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Funding Terms
          </div>
          <h3 className="serif-heading" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 16 }}>
            {selectedDeal.campaignName}
          </h3>

          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Campaign target</span>
              <b style={{ color: 'var(--ink)' }}>${selectedDeal.campaignTargetUsd}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Already funded</span>
              <b style={{ color: 'var(--emerald)' }}>
                ${selectedDeal.fundedUsd} ({Math.round((selectedDeal.fundedUsd / selectedDeal.campaignTargetUsd) * 100)}%)
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Lender fee share</span>
              <b style={{ color: 'var(--ink)' }}>{selectedDeal.lenderFeeSharePct}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Repayment cap</span>
              <b style={{ color: 'var(--ink)' }}>{selectedDeal.repayCapMultiplier.toFixed(2)}× (20% ROI)</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Projected payback*</span>
              <b style={{ color: 'var(--ink)' }}>~{selectedDeal.projectedPaybackHours}h</b>
            </div>
          </div>

          {/* Allocation input */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', marginBottom: 8 }}>
              CONTRIBUTION ALLOCATION (USD)
            </div>
            <div className="allocation-presets" style={{ marginBottom: 12 }}>
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`preset-chip ${allocationAmount === val ? 'active' : ''}`}
                  onClick={() => setAllocationAmount(val)}
                  style={{
                    background: allocationAmount === val ? 'var(--ink)' : '#ffffff',
                    color: allocationAmount === val ? '#ffffff' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  ${val}
                </button>
              ))}
              {remainingFunding > 0 && (
                <button
                  type="button"
                  className={`preset-chip ${allocationAmount === remainingFunding ? 'active' : ''}`}
                  onClick={() => setAllocationAmount(remainingFunding)}
                  style={{
                    background: allocationAmount === remainingFunding ? 'var(--ink)' : '#ffffff',
                    color: allocationAmount === remainingFunding ? '#ffffff' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  Max (${remainingFunding})
                </button>
              )}
            </div>

            <form onSubmit={handleFund}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--muted)' }}>$</span>
                  <input
                    type="number"
                    min="1"
                    max={remainingFunding || 1}
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(Math.max(1, Number(e.target.value)))}
                    style={{
                      background: 'transparent',
                      border: 0,
                      outline: 'none',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--ink)',
                      width: 120,
                    }}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>≈ {ethEquivalent} ETH</div>
                  <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--emerald)' }}>{poolOwnershipPct}% pool share</div>
                </div>
              </div>

              {/* Dynamic Projection box */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--green-bg)',
                  border: '1px solid #d4ebd0',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 750,
                }}
              >
                <span style={{ color: '#40792c' }}>Maximum 1.20× Return:</span>
                <span style={{ color: '#40792c', fontWeight: 800 }}>${maxRepaymentUsd}</span>
              </div>

              {remainingFunding <= 0 ? (
                <button
                  type="button"
                  className="bigfund-btn"
                  disabled
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 14,
                    background: 'var(--soft)',
                    color: 'var(--muted)',
                    cursor: 'not-allowed',
                    border: 0,
                    fontWeight: 800,
                  }}
                >
                  Pool Fully Funded
                </button>
              ) : isSuccess ? (
                <button
                  type="button"
                  className="bigfund-btn"
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 14,
                    background: '#58c939',
                    color: '#ffffff',
                    border: 0,
                    fontWeight: 850,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Funded ${allocationAmount}!</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="bigfund-btn"
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 14,
                    background: 'var(--lime)',
                    color: 'var(--lime-dark)',
                    border: 0,
                    fontWeight: 850,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(167, 255, 99, 0.4)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Fund ${allocationAmount}</span>
                </button>
              )}
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
};
