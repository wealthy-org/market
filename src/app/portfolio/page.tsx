'use client';

import React from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { ArrowLeft, Coins, CheckCircle, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PortfolioPage() {
  const { positions, claimRepayment, ethBalance } = useMarket();

  const totalDeployedUsd = positions.reduce((acc, p) => acc + p.contributedUsd, 0);
  const totalRepaidUsd = positions.reduce((acc, p) => acc + p.repaidUsd, 0);
  const totalClaimableUsd = positions.reduce((acc, p) => acc + p.claimableUsd, 0);
  const activeCount = positions.filter((p) => p.status === 'ACTIVE').length;
  const repaidCount = positions.filter((p) => p.status === 'REPAID').length;

  const handleClaim = (id: string, amount: number) => {
    claimRepayment(id);
    if (amount > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a7ff63', '#11120f', '#58c939'],
        });
      } catch {
        // confetti optional
      }
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 24px 100px' }}>
      <div style={{ marginBottom: 32 }}>
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
          <span>Back to Market</span>
        </Link>
        <div className="eyebrow">Lender Portfolio · Robinhood Chain</div>
        <h1 className="serif-heading" style={{ fontSize: 52, margin: '8px 0 12px' }}>
          Your Launch Allocations
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 600, fontSize: 16 }}>
          Track capital deployed into Pons V2 launch pools, monitor automated creator fee
          repayments, and claim streamed ETH yield directly into your wallet.
        </p>
      </div>

      {/* Portfolio Top Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 40 }}>
        <div className="metric-cell">
          <small>Capital Deployed</small>
          <b>${totalDeployedUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            ≈ {(totalDeployedUsd / ETH_PRICE_USD).toFixed(4)} ETH
          </span>
        </div>
        <div className="metric-cell">
          <small>Capital Repaid</small>
          <b style={{ color: 'var(--green-accent)' }}>${totalRepaidUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {totalDeployedUsd > 0
              ? `${Math.round((totalRepaidUsd / (totalDeployedUsd * 1.2)) * 100)}% of cap`
              : '0%'}
          </span>
        </div>
        <div className="metric-cell">
          <small>Claimable Yield</small>
          <b style={{ color: 'var(--lime-dark)' }}>${totalClaimableUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            ≈ {(totalClaimableUsd / ETH_PRICE_USD).toFixed(4)} ETH
          </span>
        </div>
        <div className="metric-cell">
          <small>Positions</small>
          <b>
            {activeCount} <span style={{ fontSize: 20, color: 'var(--muted)' }}>Active</span> /{' '}
            {repaidCount} <span style={{ fontSize: 20, color: 'var(--muted)' }}>Repaid</span>
          </b>
        </div>
      </div>

      {/* Positions Table */}
      <div className="market-box">
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <b style={{ fontSize: 15 }}>ACTIVE &amp; REPAID POSITIONS ({positions.length})</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Wallet balance: {ethBalance.toFixed(4)} ETH
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {positions.map((pos) => {
            return (
              <div
                key={pos.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderTop: '1px solid var(--line-soft)',
                  background: '#ffffff',
                }}
              >
                <div className="mini-token">
                  <div className="mini-avatar">{pos.tokenAvatar}</div>
                  <div>
                    <b style={{ fontSize: 15 }}>{pos.tokenSymbol}</b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                      {pos.campaignName} · {pos.timestamp}
                    </small>
                  </div>
                </div>

                <div>
                  <span className="label">Contributed</span>
                  <span className="value">
                    ${pos.contributedUsd.toFixed(2)}{' '}
                    <small style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      ({pos.contributedEth.toFixed(4)} ETH)
                    </small>
                  </span>
                </div>

                <div>
                  <span className="label">Repaid</span>
                  <span
                    className="value"
                    style={{
                      color: pos.repaidPct >= 100 ? 'var(--green-accent)' : 'var(--ink)',
                    }}
                  >
                    ${pos.repaidUsd.toFixed(2)} ({pos.repaidPct}%)
                  </span>
                </div>

                <div>
                  <span className="label">Claimable</span>
                  <span className="value" style={{ color: pos.claimableUsd > 0 ? 'var(--green-accent)' : 'var(--muted)' }}>
                    ${pos.claimableUsd.toFixed(2)}
                  </span>
                </div>

                <div>
                  {pos.claimableUsd > 0 ? (
                    <button
                      type="button"
                      className="btn lime sm"
                      onClick={() => handleClaim(pos.id, pos.claimableUsd)}
                    >
                      <Sparkles size={13} />
                      <span>Claim Yield</span>
                    </button>
                  ) : pos.status === 'REPAID' ? (
                    <span className="pill repaid">Fully Repaid (1.20×)</span>
                  ) : (
                    <span className="pill">Accruing Fees...</span>
                  )}
                </div>
              </div>
            );
          })}

          {positions.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              No positions found. Browse the live market to fund a launch pool!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
