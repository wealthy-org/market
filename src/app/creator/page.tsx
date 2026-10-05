'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { useAccount, useWriteContract } from 'wagmi';
import { FinanceSplitterABI } from '@/lib/contracts';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';
import { 
  ArrowLeft, 
  PlusCircle, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Coins, 
  ExternalLink, 
  Sparkles, 
  Loader2,
  Clock,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreatorPage() {
  const { deals, setIsCreateModalOpen, walletAddress } = useMarket();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'REPAID'>('ALL');
  const [claimingDealId, setClaimingDealId] = useState<string | null>(null);
  const [claimedAmounts, setClaimedAmounts] = useState<Record<string, boolean>>({});

  // Group or list deals with creator information
  const creatorDeals = deals;

  const totalRaisedUsd = creatorDeals.reduce((acc, d) => acc + d.fundedUsd, 0);
  const totalFeesGeneratedUsd = creatorDeals.reduce((acc, d) => acc + d.creatorFeesAccruedUsd, 0);
  const totalRepaidToLendersUsd = creatorDeals.reduce((acc, d) => acc + d.repaidToLendersUsd, 0);
  const totalCreatorEarnedUsd = creatorDeals.reduce(
    (acc, d) => acc + (d.creatorFeesAccruedUsd * (d.creatorFeeSharePct / 100)),
    0
  );

  const filteredDeals = creatorDeals.filter((deal) => {
    if (activeTab === 'ACTIVE' && deal.status === 'REPAID') return false;
    if (activeTab === 'REPAID' && deal.status !== 'REPAID') return false;
    return true;
  });

  const handleClaimCreatorShare = async (deal: (typeof creatorDeals)[0]) => {
    setClaimingDealId(deal.id);
    if (isConnected && deal.splitterAddress) {
      try {
        await writeContractAsync({
          address: deal.splitterAddress as `0x${string}`,
          abi: FinanceSplitterABI,
          functionName: 'claimCreatorShare',
        });
      } catch (err) {
        console.warn('Creator share onchain claim fallback:', err);
      }
    }

    setClaimedAmounts((prev) => ({ ...prev, [deal.id]: true }));
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#a7ff63', '#11120f', '#eef8e9', '#58c939'],
      });
    } catch {
      // confetti
    }
    setClaimingDealId(null);
  };

  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed">
        {/* Header Section */}
        <div style={{ marginBottom: 28 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 750,
              color: 'var(--muted)',
              marginBottom: 12,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>
          <div className="eyebrow">
            Artists &amp; Creators · Pons V2 Revenue Financing
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 6,
            }}
          >
            <div>
              <h1 className="serif-heading" style={{ fontSize: 36, margin: '0 0 8px', color: 'var(--ink)' }}>
                Artists &amp; Creators
              </h1>
              <p style={{ color: 'var(--muted)', maxWidth: 640, fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
                Turn early Pons token momentum into upfront marketing budget. Raise $299 for verified
                DEX Screener Fast-Track, automatically repaid from future trading fees via the FinanceSplitter contract.
              </p>
            </div>

            <button
              type="button"
              className="btn lime"
              style={{ padding: '10px 18px', fontSize: 13, fontWeight: 850 }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusCircle size={15} />
              <span>Create Funding Request</span>
            </button>
          </div>
        </div>

        {/* Gondi Style Stats Banner for Creators */}
        <div className="gondi-stats-banner" style={{ marginBottom: 28 }}>
          <div className="gondi-stat-card">
            <span className="label">Total Capital Raised</span>
            <div className="value-row">
              <span className="val">${totalRaisedUsd.toFixed(2)}</span>
            </div>
            <span className="sub">
              Across {creatorDeals.length} launch campaigns
            </span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Creator Fees Generated</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--emerald)' }}>
                ${totalFeesGeneratedUsd.toFixed(2)}
              </span>
            </div>
            <span className="sub">Pons V2 swap fee accrual</span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Repaid to Lenders</span>
            <div className="value-row">
              <span className="val">${totalRepaidToLendersUsd.toFixed(2)}</span>
            </div>
            <span className="sub">Streamed automatically via Splitter</span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Creator Retained Share</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--lime-dark)' }}>
                ${totalCreatorEarnedUsd.toFixed(2)}
              </span>
            </div>
            <span className="sub">25%-30% perpetual cash flow</span>
          </div>
        </div>

        {/* Tabs Filter matching Gondi screenshot 5 */}
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
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'ALL', label: `All Creators (${creatorDeals.length})` },
              { id: 'ACTIVE', label: `Active Campaigns (${creatorDeals.filter((d) => d.status !== 'REPAID').length})` },
              { id: 'REPAID', label: `Completed Repayments (${creatorDeals.filter((d) => d.status === 'REPAID').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === tab.id ? 'var(--ink)' : 'var(--soft)',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>
            Active Split: <span style={{ color: 'var(--ink)' }}>70% Lenders / 25% Creator / 5% Protocol</span>
          </div>
        </div>

        {/* High Density Table matching Gondi Artists view */}
        <div className="gondi-table-box" style={{ marginBottom: 40 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="gondi-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th>Creator &amp; Launch Token</th>
                  <th style={{ textAlign: 'right' }}>Target ($299)</th>
                  <th style={{ textAlign: 'right' }}>Raised (ETH)</th>
                  <th style={{ textAlign: 'right' }}>24H Fee Velocity</th>
                  <th style={{ textAlign: 'right' }}>Lender Repayment</th>
                  <th style={{ textAlign: 'right' }}>Creator Share</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal, index) => {
                  const fillPct = Math.min(100, Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100));
                  const maxCapUsd = deal.campaignTargetUsd * deal.repayCapMultiplier;
                  const remainingToRepayUsd = Math.max(0, maxCapUsd - deal.repaidToLendersUsd);
                  const creatorShareEarned = +(deal.creatorFeesAccruedUsd * (deal.creatorFeeSharePct / 100)).toFixed(2);
                  const isClaimed = claimedAmounts[deal.id];
                  const isClaiming = claimingDealId === deal.id;
                  const isRepaid = deal.status === 'REPAID' || remainingToRepayUsd <= 0;

                  return (
                    <tr key={deal.id}>
                      <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                        {index + 1}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {deal.token.imageUrl ? (
                            <img
                              src={deal.token.imageUrl}
                              alt={deal.token.name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                objectFit: 'cover',
                                border: '1px solid var(--line-soft)',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                                {deal.token.name} ({deal.token.symbol})
                              </span>
                              <Link
                                href={`/request/${deal.id}`}
                                style={{ color: 'var(--muted)', display: 'inline-flex' }}
                                title="View Deal Page"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              by {deal.token.creatorAddress} · {deal.token.age} old
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                          ${deal.campaignTargetUsd}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          ≈ {(deal.campaignTargetUsd / ETH_PRICE_USD).toFixed(4)} ETH
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                          ${deal.fundedUsd}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {fillPct}% funded
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                          ${deal.feeVelocity}/hr
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--emerald)' }}>
                          +{deal.feeVelocityTrend}%
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: isRepaid ? 'var(--emerald)' : 'var(--ink)' }}>
                          ${deal.repaidToLendersUsd.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {isRepaid ? '1.20× Satisfied' : `$${remainingToRepayUsd.toFixed(2)} to go`}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--lime-dark)' }}>
                          ${creatorShareEarned}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {deal.creatorFeeSharePct}% flow
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {creatorShareEarned > 0 && !isClaimed ? (
                          <button
                            type="button"
                            className="btn lime"
                            style={{ padding: '6px 14px', fontSize: 11.5, fontWeight: 850 }}
                            onClick={() => handleClaimCreatorShare(deal)}
                            disabled={isClaiming}
                          >
                            {isClaiming ? (
                              <>
                                <Loader2 size={12} className="spin" />
                                <span>Claiming...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} />
                                <span>Claim Share</span>
                              </>
                            )}
                          </button>
                        ) : isRepaid ? (
                          <span className="pill repaid" style={{ fontSize: 10.5 }} title="Fee rights returned back to creator wallet">
                            Fee Rights Returned
                          </span>
                        ) : (
                          <Link
                            href={`/request/${deal.id}`}
                            className="btn"
                            style={{ padding: '6px 14px', fontSize: 11.5, textDecoration: 'none' }}
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Guidance Cards matching Prototype */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Zap size={18} color="var(--ink)" />
              <b style={{ fontSize: 15 }}>Standardized DEX Screener Campaign</b>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              Raise the exact $299 required for DEX Screener Enhanced Token Info in pooled ETH.
              Zero debt, no liquidation thresholds, and no manual repayment invoices.
            </p>
          </div>

          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={18} color="#3d7d28" />
              <b style={{ fontSize: 15 }}>Automatic Fee Rights Return</b>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              The FinanceSplitter contract intercepts creator fee rights strictly until the 1.20× cap is satisfied.
              Once reached, 100% of perpetual trading fees automatically flow back to your wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Live Activity Stream */}
      <GondiActivityFeed />
    </div>
  );
}
