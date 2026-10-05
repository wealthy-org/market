'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import confetti from 'canvas-confetti';
import { ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

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
          colors: ['#a7ff63', '#10b981', '#ffffff'],
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
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          DEAL EXECUTION & ANALYSIS
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Inspect Cash Flow & Terms
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          Analyze real-time fee velocity, DEX volume, and 70/25/5% split mechanics before committing capital.
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
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #18231c 0%, #15181c 100%)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 16,
                  color: 'var(--lime)',
                }}
              >
                {selectedDeal.token.symbol.replace('$', '').slice(0, 3)}
              </div>
              <div>
                <b style={{ fontSize: 18, color: '#ffffff', display: 'block' }}>{selectedDeal.token.name}</b>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {selectedDeal.token.symbol} · Pons V2 Pair · by {selectedDeal.token.creatorAddress}
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

          <div style={{ marginTop: 24, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Fee velocity
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <b style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em' }}>
                ${selectedDeal.feeVelocity}
              </b>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>
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

          {/* Cash Flow SVG Chart */}
          <div
            style={{
              height: 120,
              width: '100%',
              margin: '16px 0',
              borderRadius: 12,
              background: '#121518',
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
                stroke="var(--emerald)"
                strokeWidth="2.5"
              />
              <path
                d="M0,100 C70,95 90,75 145,80 C205,85 225,60 290,65 C360,70 385,45 450,48 C510,50 540,30 600,22 L600,120 L0,120Z"
                fill="rgba(16, 185, 129, 0.12)"
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
            <div style={{ background: 'var(--surface-input)', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block', fontWeight: 700 }}>Fees Accrued</span>
              <b style={{ fontSize: 14, color: '#ffffff' }}>${selectedDeal.creatorFeesAccruedUsd.toFixed(2)}</b>
            </div>
            <div style={{ background: 'var(--surface-input)', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block', fontWeight: 700 }}>Liquidity</span>
              <b style={{ fontSize: 14, color: '#ffffff' }}>${(selectedDeal.liquidityUsd / 1000).toFixed(1)}K</b>
            </div>
            <div style={{ background: 'var(--surface-input)', border: '1px solid var(--line-soft)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block', fontWeight: 700 }}>Market Cap</span>
              <b style={{ fontSize: 14, color: '#ffffff' }}>${(selectedDeal.marketCapUsd / 1000).toFixed(1)}K</b>
            </div>
          </div>
        </div>

        {/* Right Panel: Funding Terms & Interactive Input */}
        <aside
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Funding Terms
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
            {selectedDeal.campaignName}
          </h3>

          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Campaign target</span>
              <b style={{ color: '#fff' }}>${selectedDeal.campaignTargetUsd}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Already funded</span>
              <b style={{ color: 'var(--emerald)' }}>
                ${selectedDeal.fundedUsd} ({Math.round((selectedDeal.fundedUsd / selectedDeal.campaignTargetUsd) * 100)}%)
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Lender fee share</span>
              <b style={{ color: '#fff' }}>{selectedDeal.lenderFeeSharePct}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--muted)' }}>Repayment cap</span>
              <b style={{ color: 'var(--lime)' }}>{selectedDeal.repayCapMultiplier.toFixed(2)}× (20% ROI)</b>
            </div>
          </div>

          {/* Allocation input */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>
              CHOOSE ALLOCATION (USD)
            </div>
            <div className="allocation-presets" style={{ marginBottom: 12 }}>
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`preset-chip ${allocationAmount === val ? 'active' : ''}`}
                  onClick={() => setAllocationAmount(val)}
                  style={{
                    background: allocationAmount === val ? '#ffffff' : 'var(--surface-input)',
                    color: allocationAmount === val ? '#0e1113' : 'var(--ink)',
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
                    background: allocationAmount === remainingFunding ? '#ffffff' : 'var(--surface-input)',
                    color: allocationAmount === remainingFunding ? '#0e1113' : 'var(--ink)',
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
                  background: 'var(--surface-input)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
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
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#fff',
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
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 750,
                }}
              >
                <span style={{ color: 'var(--ink-secondary)' }}>Maximum 1.20× Return:</span>
                <span style={{ color: 'var(--lime)' }}>${maxRepaymentUsd}</span>
              </div>

              {remainingFunding <= 0 ? (
                <button
                  type="button"
                  className="bigfund-btn"
                  disabled
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-elevated)',
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
                    padding: 12,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--emerald)',
                    color: '#0e1113',
                    border: 0,
                    fontWeight: 800,
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
                    padding: 12,
                    borderRadius: 'var(--radius-full)',
                    background: '#ffffff',
                    color: '#0e1113',
                    border: 0,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
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
