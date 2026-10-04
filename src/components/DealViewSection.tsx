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
          colors: ['#a7ff63', '#11120f', '#eef8e9'],
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
    <section className="section" id="deal">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">03 / Deal view</div>
          <div>
            <h2 className="serif-heading">See the cash flow, not just the market cap.</h2>
            <p className="section-copy">
              Market cap is context. Fee velocity, liquidity, trader activity, and repayment terms
              define the financing opportunity on Pons V2.
            </p>
          </div>
        </div>

        <div className="dealview-grid">
          {/* Left Panel: Token Details & Chart */}
          <div className="detail-card">
            <div className="token-row">
              <div className="token-left">
                <div className="avatar">{selectedDeal.token.avatar}</div>
                <div>
                  <b style={{ fontSize: 18 }}>{selectedDeal.token.symbol}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                    Pons V2 · {selectedDeal.token.age} old · {selectedDeal.token.pairToken} pair
                  </small>
                </div>
              </div>
              <div
                className={`pill ${
                  selectedDeal.status === 'HOT'
                    ? 'hot'
                    : selectedDeal.status === 'REPAID'
                    ? 'repaid'
                    : ''
                }`}
              >
                {selectedDeal.status}
              </div>
            </div>

            <h3 className="serif-heading" style={{ fontSize: 36, marginTop: 22, marginBottom: 8 }}>
              Fee velocity
            </h3>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 44, letterSpacing: '-0.03em' }}>
                ${selectedDeal.feeVelocity}
              </b>
              <span style={{ color: 'var(--muted)', fontSize: 15 }}>
                / hour ·{' '}
                <span
                  style={{
                    color:
                      selectedDeal.trendDirection === 'up'
                        ? 'var(--green-accent)'
                        : 'var(--red-accent)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {selectedDeal.feeVelocityTrend > 0 ? '+' : ''}
                  {selectedDeal.feeVelocityTrend}% vs prior hour
                  {selectedDeal.trendDirection === 'up' ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </span>
              </span>
            </div>

            {/* Cash Flow SVG Chart */}
            <div className="chart-box">
              <svg viewBox="0 0 600 170" preserveAspectRatio="none">
                <path
                  d="M0,145 C70,138 90,112 145,119 C205,126 225,90 290,95 C360,101 385,68 450,71 C510,74 540,45 600,34"
                  fill="none"
                  stroke="#11120f"
                  strokeWidth="3.5"
                />
                <path
                  d="M0,145 C70,138 90,112 145,119 C205,126 225,90 290,95 C360,101 385,68 450,71 C510,74 540,45 600,34 L600,170 L0,170Z"
                  fill="rgba(167,255,99,.18)"
                />
              </svg>
            </div>

            <div className="grid3">
              <div className="stat-box">
                <small>Creator fees accrued</small>
                <b>${selectedDeal.creatorFeesAccruedUsd.toFixed(2)}</b>
              </div>
              <div className="stat-box">
                <small>Liquidity</small>
                <b>${(selectedDeal.liquidityUsd / 1000).toFixed(1)}K</b>
              </div>
              <div className="stat-box">
                <small>Market cap</small>
                <b>${(selectedDeal.marketCapUsd / 1000).toFixed(1)}K</b>
              </div>
            </div>

            {/* Rolling Fee Velocity breakdown from brief.md */}
            <div
              style={{
                marginTop: 18,
                padding: '12px 16px',
                background: '#f8f7f2',
                borderRadius: 14,
                border: '1px solid var(--line-soft)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
                textAlign: 'center',
              }}
            >
              <div>
                <small style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                  5m fees
                </small>
                <b style={{ fontSize: 12 }}>${selectedDeal.rollingFees.m5}</b>
              </div>
              <div>
                <small style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                  15m fees
                </small>
                <b style={{ fontSize: 12 }}>${selectedDeal.rollingFees.m15}</b>
              </div>
              <div>
                <small style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                  1h fees
                </small>
                <b style={{ fontSize: 12 }}>${selectedDeal.rollingFees.h1}</b>
              </div>
              <div>
                <small style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                  6h fees
                </small>
                <b style={{ fontSize: 12 }}>${selectedDeal.rollingFees.h6}</b>
              </div>
              <div>
                <small style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                  24h fees
                </small>
                <b style={{ fontSize: 12 }}>${selectedDeal.rollingFees.h24}</b>
              </div>
            </div>
          </div>

          {/* Right Panel: Funding Terms & Interactive Input */}
          <aside className="detail-card">
            <div className="eyebrow">Funding terms</div>
            <h3 className="serif-heading">{selectedDeal.campaignName}</h3>

            <div className="terms-list">
              <div className="term-row">
                <span>Campaign target</span>
                <b>${selectedDeal.campaignTargetUsd}</b>
              </div>
              <div className="term-row">
                <span>Already funded</span>
                <b style={{ color: 'var(--green-accent)' }}>
                  ${selectedDeal.fundedUsd} (
                  {Math.round(
                    (selectedDeal.fundedUsd / selectedDeal.campaignTargetUsd) * 100
                  )}
                  %)
                </b>
              </div>
              <div className="term-row">
                <span>Lender fee share</span>
                <b>{selectedDeal.lenderFeeSharePct}%</b>
              </div>
              <div className="term-row">
                <span>Creator keeps</span>
                <b>{selectedDeal.creatorFeeSharePct}%</b>
              </div>
              <div className="term-row">
                <span>Repayment cap</span>
                <b>{selectedDeal.repayCapMultiplier.toFixed(2)}×</b>
              </div>
              <div className="term-row">
                <span>Projected payback*</span>
                <b>~{selectedDeal.projectedPaybackHours}h</b>
              </div>
            </div>

            {/* Presets */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                CONTRIBUTION ALLOCATION
              </div>
              <div className="allocation-presets">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`preset-chip ${allocationAmount === val ? 'active' : ''}`}
                    onClick={() => setAllocationAmount(val)}
                  >
                    ${val}
                  </button>
                ))}
                {remainingFunding > 0 && (
                  <button
                    type="button"
                    className={`preset-chip ${allocationAmount === remainingFunding ? 'active' : ''}`}
                    onClick={() => setAllocationAmount(remainingFunding)}
                  >
                    Max (${remainingFunding})
                  </button>
                )}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleFund}>
              <div className="allocation-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--muted)' }}>$</span>
                  <input
                    type="number"
                    min="1"
                    max={remainingFunding || 1}
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                    ≈ {ethEquivalent} ETH
                  </small>
                  <small style={{ color: 'var(--ink)', fontWeight: 750, fontSize: 11 }}>
                    {poolOwnershipPct}% pool share
                  </small>
                </div>
              </div>

              {/* Dynamic Projection box */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--soft)',
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>Maximum repayment (1.20× cap):</span>
                <span style={{ color: 'var(--green-accent)' }}>${maxRepaymentUsd}</span>
              </div>

              {remainingFunding <= 0 ? (
                <button type="button" className="bigfund-btn" disabled style={{ background: 'var(--soft)', color: 'var(--muted)', cursor: 'not-allowed' }}>
                  Pool fully funded
                </button>
              ) : isSuccess ? (
                <button type="button" className="bigfund-btn" style={{ background: '#58c939', color: '#fff' }}>
                  <CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Funded ${allocationAmount}!
                </button>
              ) : (
                <button type="submit" className="bigfund-btn">
                  <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Fund ${allocationAmount}
                </button>
              )}
            </form>

            <div className="risk-note">
              <ShieldAlert size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              *Projection assumes recent fee activity continues. Returns are not guaranteed.
              Capital may be partially or fully lost if trading activity falls.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
