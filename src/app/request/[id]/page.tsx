'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { FundingDeal } from '@/types/market';
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
  ExternalLink,
  ShieldCheck,
  Calculator,
  Flame,
  Clock,
  Sparkles,
  Info
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
  const [activeTab, setActiveTab] = useState<'Fund' | 'Lend' | 'Activity' | 'About'>('Fund');
  const [isTraitsOpen, setIsTraitsOpen] = useState(true);
  const [isLendersOpen, setIsLendersOpen] = useState(true);
  const [isStreamsOpen, setIsStreamsOpen] = useState(true);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'All' | 'ETH' | 'USDC'>('All');

  const deal = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase()) || deals[0];

  if (!deal) {
    return (
      <div className="wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 12 }}>
          Launch Pool Not Found
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          The requested Pons launch campaign ({dealId}) does not exist.
        </p>
        <Link href="/" className="btn dark">
          Back to Live Market
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

  // Find index of current deal for thumbnail strip navigation
  const currentIndex = deals.findIndex((d) => d.id === deal.id);
  const prevDeal = deals[(currentIndex - 1 + deals.length) % deals.length];
  const nextDeal = deals[(currentIndex + 1) % deals.length];

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: '24px 24px 100px', color: 'var(--ink)' }}>
      {/* Back Link */}
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 750,
            color: 'var(--muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Market</span>
        </Link>
      </div>

      {/* Header Bar matching Gondi's single item view */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
          paddingBottom: 20,
          borderBottom: '1px solid var(--line)',
          marginBottom: 28,
        }}
      >
        {/* Left Title & Breadcrumb Tags */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: 'var(--ink)' }}>
              {deal.token.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy token address"
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: copied ? 'var(--emerald)' : 'var(--muted)',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
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
                title="Share pool"
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Tags Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--soft)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 750,
                color: 'var(--ink)',
              }}
            >
              <span>{deal.campaignName}</span>
            </span>

            <span
              style={{
                background: 'var(--soft)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 750,
                color: 'var(--muted)',
              }}
            >
              Creator {deal.token.creatorAddress}
            </span>

            <span
              style={{
                background: 'var(--soft)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              {deal.token.symbol}
            </span>

            <span
              style={{
                background: 'rgba(167, 255, 99, 0.2)',
                color: '#11120f',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11.5,
                fontWeight: 800,
                border: '1px solid rgba(167, 255, 99, 0.4)',
              }}
            >
              Robinhood Chain 46630
            </span>
          </div>
        </div>

        {/* Right Stats Grid matching Gondi's header */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Creator
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                {deal.token.creatorAddress.slice(0, 6)}...{deal.token.creatorAddress.slice(-4)}
              </span>
              <button
                type="button"
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '2px 8px',
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
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Target
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)', marginTop: 2 }}>
              {targetEth.toFixed(4)} ETH <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>${deal.campaignTargetUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Funded
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--emerald)', marginTop: 2 }}>
              {fundedEth.toFixed(4)} ETH <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>${deal.fundedUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Repay Cap
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)', marginTop: 2 }}>
              {deal.repayCapMultiplier.toFixed(2)}x <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 750 }}>+20% ROI</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Fee Velocity
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)', marginTop: 2 }}>
              ${deal.feeVelocity}/hr <span style={{ fontSize: 11, color: deal.feeVelocityTrend >= 0 ? 'var(--emerald)' : 'var(--coral)', fontWeight: 750 }}>
                {deal.feeVelocityTrend >= 0 ? '+' : ''}{deal.feeVelocityTrend}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Gondi Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 480px) 1fr',
          gap: 36,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Big NFT Artwork + Thumbnail Carousel */}
        <div>
          {/* Main Visual Image Box */}
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 20,
              background: '#1a1b18',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
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
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                  fontWeight: 900,
                  color: 'var(--lime)',
                }}
              >
                {deal.token.symbol.replace('$', '').slice(0, 4)}
              </div>
            )}

            {/* Status Pill on top left of image */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(20, 20, 24, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 800,
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
              padding: '12px 6px',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              Robinhood Testnet Pool Contract
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <Download size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                title="Open Payback Calculator"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Collection Thumbnail Reel (exactly matching Gondi screenshot!) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 14px',
              background: 'var(--soft)',
              borderRadius: 16,
              border: '1px solid var(--line-soft)',
              marginTop: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push(`/request/${prevDeal.id}`)}
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
              <ChevronLeft size={16} />
            </button>

            {/* Thumbnail Row */}
            <div
              style={{
                display: 'flex',
                gap: 8,
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
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: isActive ? '2px solid var(--lime)' : '1px solid var(--line)',
                      boxShadow: isActive ? '0 0 10px rgba(167, 255, 99, 0.5)' : 'none',
                      padding: 0,
                      background: '#1a1b18',
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
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: 10,
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
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Gondi Tabs, Dual Action Cards, Tables */}
        <div>
          {/* Top Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 18 }}>
              {(['Fund', 'Lend', 'Activity', 'About'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--ink)' : '2px solid transparent',
                    paddingBottom: 6,
                    fontSize: 14,
                    fontWeight: activeTab === tab ? 850 : 600,
                    color: activeTab === tab ? 'var(--ink)' : 'var(--muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'Fund' ? 'Fund Pool' : tab === 'Lend' ? 'Lend & Stream' : tab}
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
                background: 'var(--soft)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: 11.5,
                fontWeight: 750,
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              <Calculator size={13} />
              <span>Show Calculator</span>
            </button>
          </div>

          {/* Activity Status Banner (like Gondi banner) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--soft)',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--ink)',
              marginBottom: 14,
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

          {/* Listing Info / Expiration Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Listed for Launch Funding on PONS</span>
              <span style={{ fontSize: 9.5, fontWeight: 800, background: 'var(--soft)', padding: '1px 6px', borderRadius: 4 }}>
                VERIFIED ESCROW
              </span>
            </div>
            <div>
              Payback Window: <b>~{deal.projectedPaybackHours} Hours</b>
            </div>
          </div>

          {/* Dual Action Cards matching Gondi screenshot */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              marginBottom: 24,
            }}
          >
            {/* Box 1: Full Buy / Fund Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>
                    {remainingEth.toFixed(4)} ETH
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
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
                  marginTop: 16,
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'var(--ink)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {remainingFunding > 0 ? 'Fund Launch Pool' : 'Pool Filled 100%'}
              </button>
            </div>

            {/* Box 2: Buy with Loan / Stream Card (Green tint card in Gondi) */}
            <div
              style={{
                background: '#1d2a1b',
                color: '#ffffff',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                border: '1px solid rgba(167, 255, 99, 0.25)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--lime)' }}>
                      0.0100 ETH
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      $25 Min
                    </span>
                  </div>

                  <span
                    style={{
                      background: 'rgba(167, 255, 99, 0.15)',
                      color: 'var(--lime)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      border: '1px solid rgba(167, 255, 99, 0.3)',
                    }}
                  >
                    1.20x Cap · +20% ROI
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                  70% DEX Fee Stream · Auto-repaid by Router
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'var(--lime)',
                  color: '#11120f',
                  border: 'none',
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

          {/* Collapsible Section 1: Traits / Specifications */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsTraitsOpen(!isTraitsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                Pool Traits & Onchain Architecture
              </span>
              {isTraitsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isTraitsOpen && (
              <div
                style={{
                  padding: '0 18px 18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
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
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--line-soft)',
                    }}
                  >
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {trait.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
                      {trait.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible Section 2: Lender Offers / Positions Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              marginBottom: 12,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsLendersOpen(!isLendersOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                  Lender Positions
                </span>
                <span
                  style={{
                    background: 'var(--soft)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {deal.uniqueTraders} Backers
                </span>
              </div>
              {isLendersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isLendersOpen && (
              <div style={{ padding: '0 18px 18px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ padding: '8px 4px' }}>Backer</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Principal</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Pool Share</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Repaid (1.20x)</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { address: '0x71C...a82F', usd: 50, eth: 0.02, share: 16.7, repaid: 12.4, status: 'REPAYING' },
                      { address: '0x88D...55f1', usd: 25, eth: 0.01, share: 8.3, repaid: 6.2, status: 'REPAYING' },
                      { address: '0x33A...9911', usd: 100, eth: 0.04, share: 33.4, repaid: 24.8, status: 'REPAYING' },
                      { address: '0x90C...44af', usd: 40, eth: 0.016, share: 13.3, repaid: 9.9, status: 'REPAYING' },
                    ].map((pos, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '10px 4px', fontWeight: 750, color: 'var(--ink)' }}>
                          {pos.address}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800 }}>
                          ${pos.usd} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({pos.eth} ETH)</span>
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          {pos.share}%
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--emerald)', fontWeight: 800 }}>
                          ${pos.repaid}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: 'var(--soft)',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {pos.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Collapsible Section 3: Fee Stream Routing Ledger */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsStreamsOpen(!isStreamsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)' }}>
                  Fee Repayment Stream History
                </span>
                <span
                  style={{
                    background: 'var(--soft)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Router Ledger
                </span>
              </div>
              {isStreamsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isStreamsOpen && (
              <div style={{ padding: '0 18px 18px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ padding: '8px 4px' }}>Source</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Fee Inflow</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>70% To Lenders</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>30% To Creator</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: 'Pons V2 LP Swap', fee: 18.40, time: '7m ago' },
                      { source: 'Pons V2 LP Swap', fee: 24.10, time: '28m ago' },
                      { source: 'Pons V2 LP Swap', fee: 11.20, time: '1h ago' },
                      { source: 'Pons V2 LP Swap', fee: 32.50, time: '2h ago' },
                    ].map((stream, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '10px 4px', fontWeight: 750, color: 'var(--ink)' }}>
                          {stream.source}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800 }}>
                          ${stream.fee.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--emerald)', fontWeight: 800 }}>
                          ${(stream.fee * 0.7).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--muted)' }}>
                          ${(stream.fee * 0.3).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>
                          {stream.time}
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
