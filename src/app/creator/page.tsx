'use client';

import React from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ArrowLeft, PlusCircle, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export default function CreatorPage() {
  const { deals, setIsCreateModalOpen, walletAddress } = useMarket();

  // Find deals where the user is creator
  const creatorDeals = deals.filter(
    (d) => d.token.creatorAddress.toLowerCase().includes('7e81') || d.token.creatorAddress === walletAddress
  );

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
        <div className="eyebrow">Creator Dashboard · Pons V2 Revenue Financing</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: 8,
          }}
        >
          <div>
            <h1 className="serif-heading" style={{ fontSize: 52, margin: '0 0 12px' }}>
              Creator Launch Pools
            </h1>
            <p style={{ color: 'var(--muted)', maxWidth: 640, fontSize: 16 }}>
              Turn your Pons token&apos;s early momentum into upfront marketing budget.
              Lenders fund your DEX Screener campaign upfront, repaid automatically
              from future creator fees through the FinanceSplitter contract.
            </p>
          </div>

          <button
            type="button"
            className="btn dark"
            style={{ padding: '12px 20px', fontSize: 14 }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusCircle size={16} />
            <span>Create New Funding Request</span>
          </button>
        </div>
      </div>

      {/* Creator Value Proposition Cards */}
      <div className="cards-grid" style={{ marginBottom: 40 }}>
        <div
          className="card-item"
          style={{ minHeight: 'auto', padding: '24px 28px', background: '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Zap size={18} color="var(--ink)" />
            <b style={{ fontSize: 16 }}>Standardized DEX Screener Campaign</b>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Raise the exact $299 needed for DEX Screener Enhanced Token Info in pooled ETH.
            No manual debt collection or loan schedules.
          </p>
        </div>

        <div
          className="card-item"
          style={{ minHeight: 'auto', padding: '24px 28px', background: '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <ShieldCheck size={18} color="#3d7d28" />
            <b style={{ fontSize: 16 }}>Automatic Recipient Return</b>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            The FinanceSplitter contract holds fee rights only until the 1.20× cap is repaid.
            Once reached, 100% of future fees are automatically redirected back to your wallet.
          </p>
        </div>
      </div>

      {/* Active Creator Deals */}
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
          <b style={{ fontSize: 15 }}>YOUR TOKEN LAUNCH DEALS ({creatorDeals.length})</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Creator wallet: {walletAddress}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {creatorDeals.map((deal) => {
            const fillPct = Math.min(
              100,
              Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100)
            );
            return (
              <div
                key={deal.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderTop: '1px solid var(--line-soft)',
                  background: '#ffffff',
                }}
              >
                <div className="mini-token">
                  <div className="mini-avatar">{deal.token.avatar}</div>
                  <div>
                    <b style={{ fontSize: 16 }}>{deal.token.symbol}</b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                      {deal.campaignName} · {deal.token.age} old
                    </small>
                  </div>
                </div>

                <div>
                  <span className="label">Funding Progress</span>
                  <span className="value">
                    ${deal.fundedUsd} / ${deal.campaignTargetUsd} ({fillPct}%)
                  </span>
                </div>

                <div>
                  <span className="label">Fee Velocity</span>
                  <span className="value up">${deal.feeVelocity}/hr</span>
                </div>

                <div>
                  <span className="label">Repaid to Lenders</span>
                  <span className="value">
                    ${deal.repaidToLendersUsd.toFixed(2)} / $
                    {(deal.campaignTargetUsd * deal.repayCapMultiplier).toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="pill">
                    {deal.fundedUsd >= deal.campaignTargetUsd
                      ? 'Campaign Executed'
                      : 'Pool Open'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
