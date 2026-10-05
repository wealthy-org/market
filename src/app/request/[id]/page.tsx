'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  ExternalLink, 
  Copy, 
  Activity, 
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const dealId = resolvedParams.id;
  const { deals, openContributionModal, activity } = useMarket();

  const [copied, setCopied] = useState(false);
  const [allocationAmount, setAllocationAmount] = useState<number>(25);

  const deal = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase());

  if (!deal) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 className="serif-heading" style={{ fontSize: 36, marginBottom: 12 }}>
          Launch Pool Not Found
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          The requested Pons launch campaign ({dealId}) does not exist or has expired.
        </p>
        <Link href="/" className="btn dark">
          Back to Live Market
        </Link>
      </div>
    );
  }

  const remainingFunding = Math.max(0, deal.campaignTargetUsd - deal.fundedUsd);
  const fillPercentage = Math.min(100, Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100));
  const poolOwnershipPct = +((allocationAmount / deal.campaignTargetUsd) * 100).toFixed(2);
  const maxRepaymentUsd = +(allocationAmount * deal.repayCapMultiplier).toFixed(2);
  const ethEquivalent = +(allocationAmount / ETH_PRICE_USD).toFixed(4);

  // Velocity status definition according to Brief Section 14
  const velocityCategory = 
    deal.feeVelocityTrend > 15 ? 'ACCELERATING' : 
    deal.feeVelocityTrend < -10 ? 'COOLING' : 'STABLE';

  const dealActivity = activity.filter((a) => a.dealId === deal.id);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(deal.token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="wrap" style={{ padding: '50px 24px 100px' }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--muted)',
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Live Market</span>
        </Link>

        {/* Token Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
              {deal.token.avatar}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="serif-heading" style={{ fontSize: 36, margin: 0 }}>
                  {deal.token.name}
                </h1>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--muted)' }}>
                  {deal.token.symbol}
                </span>
                <span className={`pill ${deal.status === 'HOT' ? 'hot' : deal.status === 'REPAID' ? 'repaid' : ''}`}>
                  {deal.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                <span>Pons V2</span>
                <span>•</span>
                <span>{deal.token.age} old</span>
                <span>•</span>
                <span>{deal.token.chain}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? 'var(--green-accent)' : 'var(--muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11.5,
                    fontFamily: 'monospace',
                  }}
                >
                  <span>{deal.token.address.slice(0, 8)}...{deal.token.address.slice(-6)}</span>
                  <Copy size={11} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {remainingFunding > 0 ? (
              <button
                type="button"
                className="btn dark"
                style={{ padding: '12px 24px', fontSize: 14 }}
                onClick={() => openContributionModal(deal)}
              >
                <Sparkles size={16} />
                <span>Fund This Launch Pool</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                style={{ padding: '12px 20px', fontSize: 14, cursor: 'default' }}
                disabled
              >
                <CheckCircle2 size={16} color="var(--green-accent)" />
                <span>100% Funded · In Repayment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Panel Analysis & Right Panel Funding */}
      <div className="dealview-grid" style={{ marginTop: 32 }}>
        {/* Left Panel */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Fee Velocity Card */}
          <div className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9.5 }}>Cash-Flow Velocity (Brief Sec. 14)</div>
                <h3 className="serif-heading" style={{ fontSize: 28, margin: '2px 0 0' }}>
                  Rolling Creator Fee Generation
                </h3>
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  background: velocityCategory === 'ACCELERATING' ? 'var(--green-bg)' : '#f5f4ef',
                  color: velocityCategory === 'ACCELERATING' ? 'var(--green-accent)' : 'var(--ink)',
                  border: '1px solid var(--line-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {velocityCategory === 'ACCELERATING' && <Flame size={12} />}
                <span>{velocityCategory}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '16px 0 8px' }}>
              <b style={{ fontSize: 48, letterSpacing: '-0.03em' }}>
                ${deal.feeVelocity}
              </b>
              <span style={{ color: 'var(--muted)', fontSize: 15 }}>
                / hour ·{' '}
                <span
                  style={{
                    color: deal.trendDirection === 'up' ? 'var(--green-accent)' : 'var(--red-accent)',
                    fontWeight: 750,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {deal.feeVelocityTrend > 0 ? '+' : ''}{deal.feeVelocityTrend}% vs prior hour
                  {deal.trendDirection === 'up' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </span>
              </span>
            </div>

            {/* Rolling Fee Breakdown Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
                background: 'var(--soft)',
                padding: '12px 14px',
                borderRadius: 14,
                margin: '16px 0',
                textAlign: 'center',
              }}
            >
              <div>
                <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>5m fees</small>
                <b style={{ fontSize: 13 }}>${deal.rollingFees.m5}</b>
              </div>
              <div>
                <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>15m fees</small>
                <b style={{ fontSize: 13 }}>${deal.rollingFees.m15}</b>
              </div>
              <div>
                <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>1h fees</small>
                <b style={{ fontSize: 13, color: 'var(--green-accent)' }}>${deal.rollingFees.h1}</b>
              </div>
              <div>
                <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>6h fees</small>
                <b style={{ fontSize: 13 }}>${deal.rollingFees.h6}</b>
              </div>
              <div>
                <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>24h fees</small>
                <b style={{ fontSize: 13 }}>${deal.rollingFees.h24}</b>
              </div>
            </div>

            {/* SVG Velocity Chart */}
            <div className="chart-box" style={{ height: 130 }}>
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
          </div>

          {/* Underwriting & Token Metrics Card */}
          <div className="detail-card">
            <div className="eyebrow" style={{ fontSize: 9.5 }}>Pons V2 Underwriting Signals</div>
            <h3 className="serif-heading" style={{ fontSize: 24, margin: '2px 0 16px' }}>
              Onchain Health &amp; Liquidity
            </h3>

            <div className="grid3" style={{ marginBottom: 20 }}>
              <div className="stat-box">
                <small>Creator fees accrued</small>
                <b>${deal.creatorFeesAccruedUsd.toFixed(2)}</b>
              </div>
              <div className="stat-box">
                <small>Liquidity (WETH)</small>
                <b>${(deal.liquidityUsd / 1000).toFixed(1)}K</b>
              </div>
              <div className="stat-box">
                <small>Market Cap</small>
                <b>${(deal.marketCapUsd / 1000).toFixed(1)}K</b>
              </div>
            </div>

            {/* Eligibility Signals */}
            <div style={{ background: '#ffffff', border: '1px solid var(--line-soft)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', marginBottom: 8 }}>
                V1 ELIGIBILITY AUDIT (BRIEF SEC. 13)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Token age &gt;= 15m ({deal.token.age})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Unique traders &gt;= 20 ({deal.uniqueTraders})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Fees generated &gt;= $15 (${deal.creatorFeesAccruedUsd.toFixed(2)})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Recipient transferable to Splitter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Escrow & Vendor Execution Safeguard (Brief Sec. 18) */}
          <div className="detail-card">
            <div className="eyebrow" style={{ fontSize: 9.5 }}>Lender Protection Safeguards</div>
            <h3 className="serif-heading" style={{ fontSize: 24, margin: '2px 0 12px' }}>
              Campaign Escrow &amp; Splitter Contracts
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              Principal is held securely in <code>CampaignEscrow</code> and only released for DEX Screener
              Enhanced Token Info purchase. Future creator fees are enforced onchain via <code>FinanceSplitter</code>.
            </p>

            <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--soft)', borderRadius: 10 }}>
                <span style={{ color: 'var(--muted)' }}>FinanceSplitter Contract</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {deal.splitterAddress.slice(0, 10)}...{deal.splitterAddress.slice(-8)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--soft)', borderRadius: 10 }}>
                <span style={{ color: 'var(--muted)' }}>Repayment Cap Rule</span>
                <b>1.20× fixed cap · Auto-returns fee rights</b>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Funding Terms & Interactive Input */}
        <aside className="detail-card" style={{ height: 'fit-content' }}>
          <div className="eyebrow">Launch Funding Pool</div>
          <h3 className="serif-heading" style={{ fontSize: 28, margin: '2px 0 14px' }}>
            {deal.campaignName}
          </h3>

          {/* Progress Bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              <span>Pool Funding Progress</span>
              <span style={{ color: 'var(--green-accent)' }}>${deal.fundedUsd} / ${deal.campaignTargetUsd} ({fillPercentage}%)</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${fillPercentage}%` }} />
            </div>
          </div>

          {/* Terms List */}
          <div className="terms-list">
            <div className="term-row">
              <span>Campaign Target</span>
              <b>${deal.campaignTargetUsd} in ETH</b>
            </div>
            <div className="term-row">
              <span>Lender Fee Share</span>
              <b>{deal.lenderFeeSharePct}%</b>
            </div>
            <div className="term-row">
              <span>Creator Retained Share</span>
              <b>{deal.creatorFeeSharePct}%</b>
            </div>
            <div className="term-row">
              <span>Repayment Cap</span>
              <b>{deal.repayCapMultiplier.toFixed(2)}× (${(deal.campaignTargetUsd * deal.repayCapMultiplier).toFixed(2)})</b>
            </div>
            <div className="term-row">
              <span>Projected Payback</span>
              <b>~{deal.projectedPaybackHours}h</b>
            </div>
          </div>

          {/* Contribution Controls */}
          {remainingFunding > 0 ? (
            <div style={{ marginTop: 24 }}>
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
                <button
                  type="button"
                  className={`preset-chip ${allocationAmount === remainingFunding ? 'active' : ''}`}
                  onClick={() => setAllocationAmount(remainingFunding)}
                >
                  Max (${remainingFunding})
                </button>
              </div>

              <div className="allocation-box" style={{ margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--muted)' }}>$</span>
                  <input
                    type="number"
                    min="1"
                    max={remainingFunding}
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>≈ {ethEquivalent} ETH</span>
                </div>
              </div>

              {/* Dynamic Projection */}
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
                <span style={{ color: 'var(--muted)' }}>Max Repayment ({deal.repayCapMultiplier}×):</span>
                <span style={{ color: 'var(--green-accent)' }}>${maxRepaymentUsd}</span>
              </div>

              <button
                type="button"
                className="bigfund-btn"
                onClick={() => openContributionModal(deal)}
              >
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Fund ${allocationAmount} ({ethEquivalent} ETH)
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: 24,
                padding: '18px 20px',
                background: 'var(--green-bg)',
                borderRadius: 14,
                textAlign: 'center',
                color: 'var(--green-accent)',
                fontWeight: 750,
                fontSize: 14,
              }}
            >
              <CheckCircle2 size={24} style={{ margin: '0 auto 6px', display: 'block' }} />
              Pool 100% Filled! Campaign is currently active and repaying lenders.
            </div>
          )}

          <div className="risk-note" style={{ textAlign: 'center', marginTop: 14 }}>
            <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            *Maximum if the deal fully repays. Not guaranteed. Pro-rata repayment streamed from Pons creator fees.
          </div>
        </aside>
      </div>

      {/* Pool Activity for this deal */}
      {dealActivity.length > 0 && (
        <div className="market-box" style={{ marginTop: 40 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 800, fontSize: 14 }}>
            RECENT ONCHAIN ACTIVITY FOR {deal.token.symbol}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {dealActivity.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderTop: '1px solid var(--line-soft)',
                  fontSize: 13,
                }}
              >
                <div>
                  <b>{act.details}</b>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    By {act.userAddress} · {act.timestamp}
                  </div>
                </div>
                <span className="pill" style={{ fontSize: 11 }}>{act.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
