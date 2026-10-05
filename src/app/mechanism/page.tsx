'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, Code, ExternalLink, CheckCircle2, Lock } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';

export const dynamic = 'force-static';

export default function MechanismPage() {
  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed">
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
            <span>Back to Home</span>
          </Link>
          <div className="eyebrow">02 / Mechanism &amp; Smart Contracts</div>
          <h1 className="serif-heading" style={{ fontSize: 44, margin: '8px 0 12px', color: 'var(--ink)' }}>
            Capital Today. Fees Tomorrow.
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680, fontSize: 16, lineHeight: 1.6 }}>
            Funding is tied directly to one verified launch expense ($299 DEX Screener Fast-Track).
            Future creator fees from Pons V2 are routed through the FinanceSplitter contract until
            lenders reach the 1.20x repayment cap. Once completed, fee rights automatically return to the creator.
          </p>
        </div>

        {/* Mechanism Two-Card Comparison (Matching Prototype) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 36,
          }}
        >
          {/* Card 1: For Creators */}
          <article
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="eyebrow">For creators</span>
              <Zap size={16} color="var(--ink)" />
            </div>

            <h3 className="serif-heading" style={{ fontSize: 28, color: 'var(--ink)', margin: '6px 0 12px' }}>
              Turn traction into budget.
            </h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Once a token shows early activity on Pons V2, open a standardized $299 pool. Exchange a temporary 70% share of future trading fees for immediate launch visibility.
            </p>

            <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--line)', background: '#ffffff', borderRadius: 12, fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>
                  1. Live Pons token
                </div>
                <ArrowRight size={14} color="var(--muted)" />
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--line)', background: '#ffffff', borderRadius: 12, fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>
                  2. Funding request
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--line)', background: '#ffffff', borderRadius: 12, fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>
                  3. Pool fills 100%
                </div>
                <ArrowRight size={14} color="var(--muted)" />
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--line)', background: '#ffffff', borderRadius: 12, fontSize: 12, fontWeight: 800, color: 'var(--emerald)' }}>
                  4. DEX Screener paid
                </div>
              </div>
            </div>
          </article>

          {/* Card 2: For Lenders (Dark Ink Card) */}
          <article
            style={{
              background: 'var(--ink)',
              color: '#ffffff',
              border: '1px solid var(--ink)',
              borderRadius: 'var(--radius-xl)',
              padding: 28,
              boxShadow: '0 14px 40px rgba(17, 18, 15, 0.16)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="eyebrow" style={{ color: '#aeb0a8' }}>
                For lenders
              </span>
              <ShieldCheck size={16} color="var(--lime)" />
            </div>

            <h3 className="serif-heading" style={{ fontSize: 28, color: '#ffffff', margin: '6px 0 12px' }}>
              Own a slice of the fee stream.
            </h3>
            <p style={{ fontSize: 14, color: '#bec0b9', lineHeight: 1.6, marginBottom: 24 }}>
              Enter with small pooled contributions (from $10 in ETH). Receive automatic 70% pro-rata distributions on each swap until your 1.20x fixed cap is met.
            </p>

            <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid #3c3e38', background: '#20221e', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  1. Fund pool with ETH
                </div>
                <ArrowRight size={14} color="#aeb0a8" />
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid #3c3e38', background: '#20221e', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  2. 70% creator fees
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid #3c3e38', background: '#20221e', borderRadius: 12, fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  3. 1.20x cap reached
                </div>
                <ArrowRight size={14} color="#aeb0a8" />
                <div style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--lime)', background: '#20221e', borderRadius: 12, fontSize: 12, fontWeight: 800, color: 'var(--lime)' }}>
                  4. Recycle &amp; fund again
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Interactive 1.20x Repayment Calculator */}
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 36,
            boxShadow: '0 8px 24px rgba(20, 20, 15, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Zap size={18} style={{ color: 'var(--ink)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              Simulate Your 1.20× Repayment Stream
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Enter a sample contribution to calculate your guaranteed pro-rata share from the 70% trading fee stream.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16,
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div>
              <span className="eyebrow" style={{ fontSize: 10.5 }}>Your Contribution</span>
              <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--ink)', marginTop: 4 }}>$50.00</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Pool size: $299.00</span>
            </div>

            <div>
              <span className="eyebrow" style={{ fontSize: 10.5 }}>Guaranteed Return</span>
              <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--emerald)', marginTop: 4 }}>$60.00</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>1.20× fixed ceiling</span>
            </div>

            <div>
              <span className="eyebrow" style={{ fontSize: 10.5 }}>Lender Fee Split</span>
              <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--ink)', marginTop: 4 }}>70.0%</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Pro-rata allocation</span>
            </div>

            <div>
              <span className="eyebrow" style={{ fontSize: 10.5 }}>At $25/hr Volume</span>
              <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--lime-dark)', marginTop: 4 }}>~8.4 hrs</div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Estimated full payout</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/pools" className="btn lime" style={{ fontSize: 12.5, fontWeight: 800, textDecoration: 'none' }}>
              Explore Live Pools →
            </Link>
          </div>
        </div>

        {/* Smart Contracts Architecture Box */}
        <div className="market-box" style={{ padding: 24, marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Code size={18} style={{ color: 'var(--ink)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
              Onchain Protocol Architecture (Robinhood Chain Testnet ID 46630)
            </h3>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {[
              {
                name: 'FundingPool.sol',
                purpose: 'Pooled ETH escrow with all-or-nothing threshold ($299 target). Automatic refund if target is not met within deadline.',
                address: CONTRACT_ADDRESSES.samplePool,
              },
              {
                name: 'FinanceSplitter.sol',
                purpose: 'Pons V2 fee receiver. Splits 70% to lenders, 25% to creator, 5% to protocol. Enforces strict 1.20x cap return.',
                address: CONTRACT_ADDRESSES.splitter,
              },
              {
                name: 'FundingPoolFactory.sol',
                purpose: 'Permissionless factory deploying standardized funding pools and splitter pairs on Robinhood Chain.',
                address: CONTRACT_ADDRESSES.factory,
              },
              {
                name: 'MockPonsV2.sol',
                purpose: 'Simulates live trading volume, swaps, and programmatic creator fee accumulation on testnet.',
                address: CONTRACT_ADDRESSES.mockPons,
              },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: '#ffffff',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 12,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <b style={{ fontSize: 14, color: 'var(--ink)', display: 'block', marginBottom: 2 }}>{c.name}</b>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>{c.purpose}</p>
                </div>
                <a
                  href={`https://robinhoodchain.blockscout.com/address/${c.address}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--ink)',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  <span>{c.address.slice(0, 10)}...{c.address.slice(-6)}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GondiActivityFeed />
    </div>
  );
}
