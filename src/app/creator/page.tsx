'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { useAccount, useWriteContract } from 'wagmi';
import { FinanceSplitterABI } from '@/lib/contracts';
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
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CreatorPage() {
  const { deals, setIsCreateModalOpen, walletAddress } = useMarket();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [claimingDealId, setClaimingDealId] = useState<string | null>(null);
  const [claimedAmounts, setClaimedAmounts] = useState<Record<string, boolean>>({});

  // Find deals belonging to creator or mock creator
  const creatorDeals = deals.filter(
    (d) =>
      d.token.creatorAddress.toLowerCase().includes('7e81') ||
      d.token.creatorAddress === walletAddress ||
      walletAddress.toLowerCase().includes('7681') ||
      d.id === 'pny' ||
      d.id === 'whl'
  );

  const totalRaisedUsd = creatorDeals.reduce((acc, d) => acc + d.fundedUsd, 0);
  const totalFeesGeneratedUsd = creatorDeals.reduce((acc, d) => acc + d.creatorFeesAccruedUsd, 0);
  const totalRepaidToLendersUsd = creatorDeals.reduce((acc, d) => acc + d.repaidToLendersUsd, 0);
  const totalCreatorEarnedUsd = creatorDeals.reduce(
    (acc, d) => acc + (d.creatorFeesAccruedUsd * (d.creatorFeeSharePct / 100)),
    0
  );

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
          <span>Back to Live Market</span>
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
              Lenders fund your DEX Screener campaign upfront ($299), repaid automatically
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

      {/* Creator Top Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 36 }}>
        <div className="metric-cell">
          <small>Total Capital Raised</small>
          <b>${totalRaisedUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Across {creatorDeals.length} launch campaigns
          </span>
        </div>
        <div className="metric-cell">
          <small>Creator Fees Generated</small>
          <b style={{ color: 'var(--green-accent)' }}>${totalFeesGeneratedUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Total volume fee accrual
          </span>
        </div>
        <div className="metric-cell">
          <small>Repaid to Lenders</small>
          <b>${totalRepaidToLendersUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Automated stream via Splitter
          </span>
        </div>
        <div className="metric-cell">
          <small>Creator Retained Share</small>
          <b style={{ color: 'var(--lime-dark)' }}>${totalCreatorEarnedUsd.toFixed(2)}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            25%-30% retained operating flow
          </span>
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
            No personal debt or manual collection schedules.
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

      {/* Active Creator Deals List */}
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
            const maxCapUsd = deal.campaignTargetUsd * deal.repayCapMultiplier;
            const remainingToRepayUsd = Math.max(0, maxCapUsd - deal.repaidToLendersUsd);
            const creatorShareEarned = +(deal.creatorFeesAccruedUsd * (deal.creatorFeeSharePct / 100)).toFixed(2);
            const isClaimed = claimedAmounts[deal.id];
            const isClaiming = claimingDealId === deal.id;
            const isRepaid = deal.status === 'REPAID' || remainingToRepayUsd <= 0;

            return (
              <div
                key={deal.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: '22px 24px',
                  borderTop: '1px solid var(--line-soft)',
                  background: '#ffffff',
                }}
              >
                <div className="mini-token">
                  <div className="mini-avatar">{deal.token.avatar}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <b style={{ fontSize: 16 }}>{deal.token.symbol}</b>
                      <Link
                        href={`/request/${deal.id}`}
                        style={{ color: 'var(--muted)', display: 'inline-flex' }}
                        title="View Public Deal Page"
                      >
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
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
                  <span className="label">Lender Repayment</span>
                  <span className="value">
                    ${deal.repaidToLendersUsd.toFixed(2)} / ${maxCapUsd.toFixed(2)}
                  </span>
                  <small style={{ display: 'block', fontSize: 11, color: isRepaid ? 'var(--green-accent)' : 'var(--muted)' }}>
                    {isRepaid ? '1.20× Cap Satisfied!' : `$${remainingToRepayUsd.toFixed(2)} remaining`}
                  </small>
                </div>

                <div>
                  <span className="label">Your Retained Share</span>
                  <span className="value" style={{ color: 'var(--lime-dark)' }}>
                    ${creatorShareEarned}
                  </span>
                  <small style={{ display: 'block', fontSize: 11, color: 'var(--muted)' }}>
                    {deal.creatorFeeSharePct}% operating flow
                  </small>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {creatorShareEarned > 0 && !isClaimed ? (
                    <button
                      type="button"
                      className="btn lime sm"
                      onClick={() => handleClaimCreatorShare(deal)}
                      disabled={isClaiming}
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 size={13} className="spin" />
                          <span>Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Claim Share</span>
                        </>
                      )}
                    </button>
                  ) : isRepaid ? (
                    <span className="pill repaid" title="100% of future trading fees are now directed to you">
                      Fee Rights Returned
                    </span>
                  ) : (
                    <span className="pill">
                      {deal.fundedUsd >= deal.campaignTargetUsd ? 'Repaying Lenders' : 'Pool Open'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
