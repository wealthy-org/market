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
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  Coins, 
  ExternalLink,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PortfolioPage() {
  const { positions, claimRepayment, ethBalance } = useMarket();
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'REPAID'>('ALL');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const totalDeployedUsd = positions.reduce((acc, p) => acc + p.contributedUsd, 0);
  const totalRepaidUsd = positions.reduce((acc, p) => acc + p.repaidUsd, 0);
  const totalClaimableUsd = positions.reduce((acc, p) => acc + p.claimableUsd, 0);
  const activeCount = positions.filter((p) => p.status === 'ACTIVE').length;
  const repaidCount = positions.filter((p) => p.status === 'REPAID').length;

  const filteredPositions = positions.filter((pos) => {
    if (activeTab === 'ACTIVE' && pos.status !== 'ACTIVE') return false;
    if (activeTab === 'REPAID' && pos.status !== 'REPAID') return false;
    return true;
  });

  const handleClaim = async (pos: (typeof positions)[0]) => {
    setClaimingId(pos.id);

    if (isConnected && pos.splitterAddress) {
      try {
        await writeContractAsync({
          address: pos.splitterAddress as `0x${string}`,
          abi: FinanceSplitterABI,
          functionName: 'claimRepayment',
        });
      } catch (err: any) {
        console.warn('Onchain claim error or simulated fallback:', err);
      }
    }

    // Update local position state
    claimRepayment(pos.id);
    if (pos.claimableUsd > 0) {
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a7ff63', '#11120f', '#58c939', '#eef8e9'],
        });
      } catch {
        // confetti fallback
      }
    }
    setClaimingId(null);
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
            Lender Portfolio · {isConnected ? 'Live Web3 Connected' : 'Robinhood Chain Testnet'}
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
                Your Launch Allocations
              </h1>
              <p style={{ color: 'var(--muted)', maxWidth: 640, fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
                Track capital deployed into Pons V2 launch pools, monitor automated creator fee repayments,
                and claim streamed ETH yield directly into your wallet.
              </p>
            </div>

            <Link
              href="/pools"
              className="btn dark"
              style={{ padding: '10px 18px', fontSize: 13, textDecoration: 'none' }}
            >
              <Layers size={14} />
              <span>Browse Launch Pools</span>
            </Link>
          </div>
        </div>

        {/* Gondi Style Stats Banner */}
        <div className="gondi-stats-banner" style={{ marginBottom: 28 }}>
          <div className="gondi-stat-card">
            <span className="label">Capital Deployed</span>
            <div className="value-row">
              <span className="val">${totalDeployedUsd.toFixed(2)}</span>
            </div>
            <span className="sub">
              ≈ {(totalDeployedUsd / ETH_PRICE_USD).toFixed(4)} ETH
            </span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Capital Repaid</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--emerald)' }}>
                ${totalRepaidUsd.toFixed(2)}
              </span>
            </div>
            <span className="sub">
              {totalDeployedUsd > 0
                ? `${Math.round((totalRepaidUsd / (totalDeployedUsd * 1.2)) * 100)}% of 1.20× cap`
                : '0% of cap'}
            </span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Claimable Yield</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--lime-dark)' }}>
                ${totalClaimableUsd.toFixed(2)}
              </span>
            </div>
            <span className="sub">
              ≈ {(totalClaimableUsd / ETH_PRICE_USD).toFixed(4)} ETH ready
            </span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Active Positions</span>
            <div className="value-row">
              <span className="val">{activeCount}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 8 }}>
                / {repaidCount} Repaid
              </span>
            </div>
            <span className="sub">1.20× automatic return</span>
          </div>
        </div>

        {/* Tabs Filter */}
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
              { id: 'ALL', label: `All Positions (${positions.length})` },
              { id: 'ACTIVE', label: `Active Streaming (${activeCount})` },
              { id: 'REPAID', label: `Fully Repaid (${repaidCount})` },
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
            Wallet Balance: <span style={{ color: 'var(--ink)' }}>{ethBalance.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Positions Table */}
        <div className="gondi-table-box" style={{ marginBottom: 40 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="gondi-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th>Token / Launch Pool</th>
                  <th style={{ textAlign: 'right' }}>Contributed (ETH)</th>
                  <th style={{ textAlign: 'right' }}>Repaid (1.20× Cap)</th>
                  <th style={{ textAlign: 'center' }}>Cap Progress</th>
                  <th style={{ textAlign: 'right' }}>Claimable Yield</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((pos, index) => {
                  const isClaiming = claimingId === pos.id;
                  const maxCapUsd = pos.contributedUsd * 1.2;
                  const progressPct = Math.min(100, Math.round((pos.repaidUsd / maxCapUsd) * 100));

                  return (
                    <tr key={pos.id}>
                      <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                        {index + 1}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                            {pos.tokenSymbol.replace('$', '').slice(0, 3)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                                {pos.tokenSymbol}
                              </span>
                              <span
                                className={`pill ${pos.status === 'REPAID' ? 'repaid' : 'momentum'}`}
                                style={{ fontSize: 9.5, padding: '2px 7px' }}
                              >
                                {pos.status === 'REPAID' ? 'REPAID 1.20×' : 'ACCRUING'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              {pos.campaignName} · {pos.timestamp}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                          {pos.contributedEth.toFixed(4)} ETH
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          ${pos.contributedUsd.toFixed(2)}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: pos.repaidPct >= 100 ? 'var(--emerald)' : 'var(--ink)' }}>
                          ${pos.repaidUsd.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          Target: ${maxCapUsd.toFixed(2)}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ width: 100, margin: '0 auto' }}>
                          <div
                            style={{
                              height: 6,
                              background: 'var(--soft)',
                              borderRadius: 4,
                              overflow: 'hidden',
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${progressPct}%`,
                                background: progressPct >= 100 ? 'var(--emerald)' : 'var(--lime-dark)',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)' }}>
                            {progressPct}% repaid
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: pos.claimableUsd > 0 ? 'var(--emerald)' : 'var(--muted)',
                          }}
                        >
                          ${pos.claimableUsd.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          ≈ {(pos.claimableUsd / ETH_PRICE_USD).toFixed(4)} ETH
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {pos.claimableUsd > 0 ? (
                          <button
                            type="button"
                            className="btn lime"
                            style={{ padding: '6px 14px', fontSize: 11.5, fontWeight: 850 }}
                            onClick={() => handleClaim(pos)}
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
                                <span>Claim Yield</span>
                              </>
                            )}
                          </button>
                        ) : pos.status === 'REPAID' ? (
                          <span className="pill repaid" style={{ fontSize: 11 }}>
                            Completed
                          </span>
                        ) : (
                          <span className="pill" style={{ fontSize: 11 }}>
                            Streaming...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPositions.length === 0 && (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--paper)',
              }}
            >
              <Coins size={32} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                No allocations found
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 440, margin: '0 auto 16px' }}>
                You have not contributed to any live launch pools yet. Back an active token to start earning 70% automated fee streams.
              </p>
              <Link href="/pools" className="btn lime" style={{ textDecoration: 'none' }}>
                Browse Active Pools
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Activity Stream */}
      <GondiActivityFeed />
    </div>
  );
}
