'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Share2, 
  RefreshCw, 
  Maximize2, 
  Download, 
  LineChart,
  Coins,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { PaybackCalculatorModal } from '@/components/PaybackCalculatorModal';

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const dealId = resolvedParams.id;
  const router = useRouter();
  const { deals, openContributionModal, activity } = useMarket();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'Buy' | 'Lend' | 'Activity' | 'About'>('Buy');
  const [isTraitsOpen, setIsTraitsOpen] = useState(true);
  const [isBuyOffersOpen, setIsBuyOffersOpen] = useState(true);
  const [isLoanOffersOpen, setIsLoanOffersOpen] = useState(true);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [offerFilter, setOfferFilter] = useState<'All' | 'ETH' | 'USDC'>('All');
  const [loanFilter, setLoanFilter] = useState<'All' | 'ETH' | 'USDC'>('All');

  const deal = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase()) || deals[0];

  if (!deal) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', padding: '80px 24px', textAlign: 'center' }}>
        <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 12 }}>Launch Pool Not Found</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The requested launch pool does not exist.</p>
        <Link href="/" className="btn dark">
          Back to Market
        </Link>
      </div>
    );
  }

  const remainingFunding = Math.max(0, deal.campaignTargetUsd - deal.fundedUsd);
  const targetEth = deal.campaignTargetUsd / ETH_PRICE_USD;
  const fundedEth = deal.fundedUsd / ETH_PRICE_USD;
  const remainingEth = remainingFunding / ETH_PRICE_USD;
  const repayCapUsd = deal.campaignTargetUsd * deal.repayCapMultiplier;
  const repayCapEth = repayCapUsd / ETH_PRICE_USD;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(deal.token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentIndex = deals.findIndex((d) => d.id === deal.id);
  const prevDeal = deals[(currentIndex - 1 + deals.length) % deals.length];
  const nextDeal = deals[(currentIndex + 1) % deals.length];

  return (
    <div className="detail-page-container">
      {/* Top Header Bar harmonized with prototype colors */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 12,
          borderBottom: '1px solid var(--line)',
          marginBottom: 14,
          flexShrink: 0,
        }}
      >
        {/* Left Title & Breadcrumbs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              {deal.token.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy address"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: copied ? 'var(--emerald)' : 'var(--muted)',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: deal.token.name, url: window.location.href });
                  } else {
                    handleCopy();
                  }
                }}
                title="Share"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                <Share2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => router.refresh()}
                title="Refresh"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Tags Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                padding: '3px 9px',
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {deal.campaignName}
            </span>

            <span
              style={{
                background: 'var(--soft)',
                border: '1px solid var(--line-soft)',
                color: 'var(--muted)',
                padding: '3px 9px',
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              Creator {deal.token.creatorAddress.slice(0, 6)}...{deal.token.creatorAddress.slice(-4)}
            </span>

            <span
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                padding: '3px 9px',
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              {deal.token.symbol}
            </span>

            <span
              style={{
                background: '#eef8e9',
                border: '1px solid #cce8c2',
                color: '#40792c',
                padding: '3px 9px',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Robinhood Chain 46630
            </span>
          </div>
        </div>

        {/* Right Stats Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Owner
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                {deal.token.creatorAddress.slice(0, 6)}...{deal.token.creatorAddress.slice(-4)}
              </span>
              <button
                type="button"
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '2px 7px',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                + Follow
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Price
            </div>
            <div style={{ fontWeight: 850, fontSize: 14, color: 'var(--ink)', marginTop: 3 }}>
              {targetEth.toFixed(4)} ETH <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>${deal.campaignTargetUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Top Bid
            </div>
            <div style={{ fontWeight: 850, fontSize: 14, color: 'var(--emerald)', marginTop: 3 }}>
              {fundedEth.toFixed(4)} ETH <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>${deal.fundedUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Floor
            </div>
            <div style={{ fontWeight: 850, fontSize: 14, color: 'var(--ink)', marginTop: 3 }}>
              {repayCapEth.toFixed(4)} ETH <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 750 }}>1.20x Cap</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Last Sale (12h ago)
            </div>
            <div style={{ fontWeight: 850, fontSize: 14, color: 'var(--ink)', marginTop: 3 }}>
              ${deal.feeVelocity}/hr <span style={{ fontSize: 11, color: deal.feeVelocityTrend >= 0 ? 'var(--emerald)' : 'var(--coral)', fontWeight: 800 }}>
                {deal.feeVelocityTrend >= 0 ? '+' : ''}{deal.feeVelocityTrend}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width 2-Column Grid */}
      <div className="detail-page-layout">
        {/* Left Column: Artwork + Collection Reel (Pinned) */}
        <div className="detail-left-pane">
          {/* Main Visual Image Box */}
          <div className="detail-artwork-frame">
            {deal.token.imageUrl ? (
              <img
                src={deal.token.imageUrl}
                alt={deal.token.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: 'var(--ink)',
                }}
              >
                {deal.token.symbol.replace('$', '').slice(0, 4)}
              </div>
            )}

            {/* Repaying / Status Pill */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(17, 18, 15, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 750,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {deal.status} · {Math.round((deal.fundedUsd / deal.campaignTargetUsd) * 100)}% Funded
            </div>
          </div>

          {/* Under-Image Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 4px 2px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 650 }}>
              Robinhood Testnet Pool Contract
            </div>
            <div style={{ display: 'flex', gap: 12, color: 'var(--muted)' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                title="Copy address"
              >
                <Download size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                title="Open Simulator"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Collection Thumbnail Reel matching Gondi */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              background: 'var(--paper)',
              borderRadius: 12,
              border: '1px solid var(--line)',
              marginTop: 4,
              boxShadow: '0 2px 10px rgba(17, 18, 15, 0.02)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => router.push(`/request/${prevDeal.id}`)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink)',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} />
            </button>

            {/* Thumbnail Row */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                flex: 1,
                alignItems: 'center',
              }}
            >
              {deals.map((d) => {
                const isActive = d.id === deal.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => router.push(`/request/${d.id}`)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: isActive ? '2px solid var(--ink)' : '1px solid var(--line)',
                      boxShadow: isActive ? '0 0 0 2px var(--lime)' : 'none',
                      padding: 0,
                      background: '#ffffff',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d.token.imageUrl ? (
                      <img
                        src={d.token.imageUrl}
                        alt={d.token.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--ink)',
                          fontWeight: 800,
                          fontSize: 10.5,
                          background: 'var(--soft)',
                        }}
                      >
                        {d.token.symbol.replace('$', '').slice(0, 3)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => router.push(`/request/${nextDeal.id}`)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--ink)',
                flexShrink: 0,
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Right Column: Tabs, Dual Action Cards, Tables (Scrollable) */}
        <div className="detail-scroll-pane">
          {/* Top Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 24 }}>
              {(['Buy', 'Lend', 'Activity', 'About'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--ink)' : '2px solid transparent',
                    paddingBottom: 6,
                    fontSize: 13.5,
                    fontWeight: activeTab === tab ? 850 : 600,
                    color: activeTab === tab ? 'var(--ink)' : 'var(--muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'Buy' ? 'Buy / Fund' : tab === 'Lend' ? 'Lend & Stream' : tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCalcOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 11.5,
                fontWeight: 750,
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              <LineChart size={13} />
              <span>Show Insights</span>
            </button>
          </div>

          {/* Activity Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: '9px 14px',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--ink)',
              marginBottom: 14,
              boxShadow: '0 2px 8px rgba(17, 18, 15, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--emerald)',
                  boxShadow: '0 0 6px var(--emerald)',
                }}
              />
              <span>
                <b>{deal.token.name}</b> fee router streamed <b>${(deal.creatorFeesAccruedUsd * 0.7).toFixed(2)}</b> to lenders (Pons V2)
              </span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>Active onchain</span>
          </div>

          {/* Listing Info Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Listed for Launch Funding on PONS</span>
              <span style={{ fontSize: 9.5, fontWeight: 800, background: '#eef8e9', color: '#40792c', border: '1px solid #cce8c2', padding: '1px 6px', borderRadius: 4 }}>
                VERIFIED ESCROW
              </span>
            </div>
            <div>
              Payback Window: <b>~{deal.projectedPaybackHours} Hours</b>
            </div>
          </div>

          {/* Dual Action Cards matching prototype color harmony */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              marginBottom: 20,
            }}
          >
            {/* Box 1: Buy Now Card (Crisp clean paper card) */}
            <div
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 18px rgba(17, 18, 15, 0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>
                    {remainingEth.toFixed(4)} ETH
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    ${remainingFunding}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  100% Target Escrow Completion
                </div>
              </div>

              <button
                type="button"
                onClick={() => openContributionModal(deal)}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 10,
                  background: 'var(--ink)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {remainingFunding > 0 ? 'Fund Launch Pool' : 'Pool Filled'}
              </button>
            </div>

            {/* Box 2: Buy with Loan Card (Fresh soft mint green card matching prototype) */}
            <div
              style={{
                background: '#eef8e9',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #cbe9bf',
                boxShadow: '0 4px 18px rgba(64, 121, 44, 0.05)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#18310a' }}>
                      {(25 / ETH_PRICE_USD).toFixed(4)} ETH
                    </span>
                    <span style={{ fontSize: 12, color: '#40792c', fontWeight: 650 }}>
                      $25 Min
                    </span>
                  </div>

                  {/* Dropdown pill */}
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#40792c',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      border: '1px solid #c9e8be',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>1.20x Cap · +20% ROI</span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#40792c', marginTop: 4 }}>
                  70% DEX Fee Stream · Auto-repaid by Router
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 10,
                  background: 'var(--lime)',
                  color: '#18310a',
                  border: '1px solid #94eb50',
                  fontSize: 13.5,
                  fontWeight: 850,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>Calculate & Lend</span>
              </button>
            </div>
          </div>

          {/* Collapsible Section 1: Traits */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              marginBottom: 10,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsTraitsOpen(!isTraitsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                {isTraitsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span>Pool Traits & Onchain Architecture</span>
              </div>
            </div>

            {isTraitsOpen && (
              <div
                style={{
                  padding: '0 18px 18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {[
                  { label: 'Pair Token', value: 'WETH' },
                  { label: 'DEX Router', value: 'Pons V2' },
                  { label: 'Lender Split', value: `${deal.lenderFeeSharePct}%` },
                  { label: 'Creator Share', value: `${deal.creatorFeeSharePct}%` },
                  { label: 'Fixed Cap', value: `${deal.repayCapMultiplier.toFixed(2)}x` },
                  { label: 'Liquidity', value: `$${deal.liquidityUsd.toLocaleString()}` },
                  { label: 'Traders', value: `${deal.uniqueTraders} Unique` },
                  { label: 'Campaign Target', value: `$${deal.campaignTargetUsd}` },
                  { label: 'Campaign Goal', value: 'DEX Screener Paid' },
                ].map((trait, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--soft)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--line-soft)',
                    }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {trait.label}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
                      {trait.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section 2: Buy Offers (36) */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              marginBottom: 10,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsBuyOffersOpen(!isBuyOffersOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isBuyOffersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                  Buy Offers
                </span>
                <span
                  style={{
                    background: 'var(--soft)',
                    color: 'var(--muted)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  36
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => openContributionModal(deal)}
                  style={{
                    background: 'var(--ink)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Make Buy Offer
                </button>
                <button
                  type="button"
                  style={{
                    background: '#ffffff',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Make Stealth Offer
                </button>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 3, background: 'var(--soft)', padding: 2, borderRadius: 6 }}>
                  {(['All', 'ETH', 'USDC'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setOfferFilter(cur)}
                      style={{
                        background: offerFilter === cur ? '#ffffff' : 'transparent',
                        color: offerFilter === cur ? 'var(--ink)' : 'var(--muted)',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 7px',
                        fontSize: 10.5,
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isBuyOffersOpen && (
              <div style={{ padding: '0 18px 14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>
                      <th style={{ padding: '8px 4px', fontWeight: 700 }}>Source</th>
                      <th style={{ padding: '8px 4px', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Offer</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Net Proceeds</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Royalties & Fees</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: '0xhotw', type: 'Collection Offer', offer: '5.1000 ETH', net: '5.0745 ETH', fee: '0.50%', exp: '10 Oct 2026, 04:03' },
                      { source: '0xhotw', type: 'Collection Offer', offer: '5.0000 ETH', net: '4.9750 ETH', fee: '0.50%', exp: '27 Oct 2026, 21:55' },
                      { source: 'NFTPER_5', type: 'Item Offer', offer: '3.3600 ETH', net: '2.9904 ETH', fee: '11.00%', exp: '22m : 19s' },
                      { source: '0x88De...55f1', type: 'Pool Allocation', offer: '0.0100 ETH', net: '0.0099 ETH', fee: '0.50%', exp: '14 Oct 2026' },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '9px 4px', fontWeight: 750, color: 'var(--ink)' }}>
                          {row.source}
                        </td>
                        <td style={{ padding: '9px 4px', color: 'var(--muted)' }}>
                          {row.type}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 800, color: 'var(--ink)' }}>
                          {row.offer}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--ink)' }}>
                          {row.net}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          {row.fee}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          {row.exp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Collapsible Section 3: Loan Offers (28) */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsLoanOffersOpen(!isLoanOffersOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isLoanOffersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>
                  Loan Offers
                </span>
                <span
                  style={{
                    background: 'var(--soft)',
                    color: 'var(--muted)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  28
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsCalcOpen(true)}
                  style={{
                    background: '#ffffff',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 11.5,
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  Make Loan Offer
                </button>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 3, background: 'var(--soft)', padding: 2, borderRadius: 6 }}>
                  {(['All', 'ETH', 'USDC'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setLoanFilter(cur)}
                      style={{
                        background: loanFilter === cur ? '#ffffff' : 'transparent',
                        color: loanFilter === cur ? 'var(--ink)' : 'var(--muted)',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 7px',
                        fontSize: 10.5,
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isLoanOffersOpen && (
              <div style={{ padding: '0 18px 14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>
                      <th style={{ padding: '8px 4px', fontWeight: 700 }}>Source</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Principal</th>
                      <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>eAPR</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>APR</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Orig. Fee</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>Loan Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: 'MISHARK', principal: '4.3000 ETH', duration: '30 D', eapr: '22.00%', apr: '15.00%', orig: '0.0244 ETH', cost: '0.0774 ETH' },
                      { source: 'trustlend.eth', principal: '10,000 USDC', duration: '30 D', eapr: '16.00%', apr: '6.00%', orig: '$81', cost: '$130' },
                      { source: 'trustlend.eth', principal: '10,000 USDC', duration: '30 D', eapr: '20.00%', apr: '10.00%', orig: '$80', cost: '$163' },
                      { source: '0xe35...85d', principal: '3.6000 ETH', duration: '7 D', eapr: '30.00%', apr: '15.00%', orig: '0.0103 ETH', cost: '0.0420 ETH' },
                      { source: 'botbotbot1', principal: '9,500 USDC', duration: '7 D', eapr: '35.00%', apr: '20.00%', orig: '$27', cost: '$68' },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '9px 4px', fontWeight: 750, color: 'var(--ink)' }}>
                          {row.source}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 800, color: 'var(--ink)' }}>
                          {row.principal}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'center', color: 'var(--muted)' }}>
                          {row.duration}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--emerald)', fontWeight: 800 }}>
                          {row.eapr}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--ink)' }}>
                          {row.apr}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          {row.orig}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          {row.cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payback Simulator Modal */}
      <PaybackCalculatorModal
        deal={deal}
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onOpenFundModal={openContributionModal}
      />
    </div>
  );
}
