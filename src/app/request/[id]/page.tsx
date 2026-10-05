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
  ExternalLink,
  ShieldCheck,
  Calculator,
  LineChart,
  Sliders,
  CheckCircle2,
  Clock
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
  const [isTraitsOpen, setIsTraitsOpen] = useState(false);
  const [isBuyOffersOpen, setIsBuyOffersOpen] = useState(true);
  const [isLoanOffersOpen, setIsLoanOffersOpen] = useState(true);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [offerFilter, setOfferFilter] = useState<'All' | 'ETH' | 'USDC'>('All');
  const [loanFilter, setLoanFilter] = useState<'All' | 'ETH' | 'USDC'>('All');
  const [loanDuration, setLoanDuration] = useState<string>('30 days - 20.00% eAPR');

  const deal = deals.find((d) => d.id.toLowerCase() === dealId.toLowerCase()) || deals[0];

  if (!deal) {
    return (
      <div style={{ background: '#141416', color: '#ffffff', minHeight: '100vh', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Launch Pool Not Found</h1>
        <p style={{ color: '#8a8b94', marginBottom: 24 }}>The requested launch pool does not exist.</p>
        <Link href="/" style={{ padding: '10px 20px', background: '#ffffff', color: '#000000', borderRadius: 8, fontWeight: 750, textDecoration: 'none' }}>
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
    <div
      style={{
        background: '#141416',
        color: '#ffffff',
        minHeight: '100vh',
        width: '100%',
        padding: '20px 32px 100px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Bar matching Gondi */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 20,
          borderBottom: '1px solid #23242b',
          marginBottom: 24,
        }}
      >
        {/* Left Title & Breadcrumbs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: 0,
                color: '#ffffff',
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
                  background: '#1c1d22',
                  border: '1px solid #2a2b34',
                  borderRadius: 6,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: copied ? '#30d158' : '#8a8b94',
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
                  background: '#1c1d22',
                  border: '1px solid #2a2b34',
                  borderRadius: 6,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#8a8b94',
                }}
              >
                <Share2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => router.refresh()}
                title="Refresh"
                style={{
                  background: '#1c1d22',
                  border: '1px solid #2a2b34',
                  borderRadius: 6,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#8a8b94',
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
                background: '#1d1e24',
                border: '1px solid #282a33',
                color: '#d1d2dd',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 650,
              }}
            >
              {deal.campaignName}
            </span>

            <span
              style={{
                background: '#1d1e24',
                border: '1px solid #282a33',
                color: '#8a8b94',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              Creator {deal.token.creatorAddress.slice(0, 6)}...{deal.token.creatorAddress.slice(-4)}
            </span>

            <span
              style={{
                background: '#1d1e24',
                border: '1px solid #282a33',
                color: '#d1d2dd',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 750,
              }}
            >
              {deal.token.symbol}
            </span>

            <span
              style={{
                background: '#18241c',
                border: '1px solid #233a2a',
                color: '#34d399',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 750,
              }}
            >
              Robinhood 46630
            </span>
          </div>
        </div>

        {/* Right Stats Row matching Gondi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
              Owner
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontWeight: 750, fontSize: 13, color: '#ffffff' }}>
                {deal.token.creatorAddress.slice(0, 6)}...{deal.token.creatorAddress.slice(-4)}
              </span>
              <button
                type="button"
                style={{
                  background: '#1d1e24',
                  border: '1px solid #282a33',
                  borderRadius: 5,
                  padding: '2px 7px',
                  fontSize: 10.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                  color: '#ffffff',
                }}
              >
                + Follow
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
              Price
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', marginTop: 3 }}>
              {targetEth.toFixed(4)} <span style={{ fontSize: 11, color: '#7a7b85', fontWeight: 500 }}>${deal.campaignTargetUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
              Top Bid
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', marginTop: 3 }}>
              {fundedEth.toFixed(4)} <span style={{ fontSize: 11, color: '#7a7b85', fontWeight: 500 }}>${deal.fundedUsd}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
              Floor
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#30d158', marginTop: 3 }}>
              {repayCapEth.toFixed(4)} <span style={{ fontSize: 11, color: '#7a7b85', fontWeight: 500 }}>1.20x Cap</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
              Last Sale (12h ago)
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#ffffff', marginTop: 3 }}>
              ${deal.feeVelocity}/hr <span style={{ fontSize: 11, color: deal.feeVelocityTrend >= 0 ? '#30d158' : '#f87171', fontWeight: 700 }}>
                {deal.feeVelocityTrend >= 0 ? '+' : ''}{deal.feeVelocityTrend}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 46%) 1fr',
          gap: 36,
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* Left Column: Artwork + Collection Reel */}
        <div>
          {/* Main Visual Image Box */}
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 16,
              background: '#0d0e10',
              border: '1px solid #23242b',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                  fontSize: 72,
                  fontWeight: 900,
                  color: '#a7ff63',
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
                background: 'rgba(18, 19, 23, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 750,
                border: '1px solid rgba(255, 255, 255, 0.12)',
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
              padding: '12px 4px 6px',
            }}
          >
            <div style={{ fontSize: 11.5, color: '#7a7b85', fontWeight: 600 }}>
              Robinhood Testnet Pool Contract
            </div>
            <div style={{ display: 'flex', gap: 14, color: '#8a8b94' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                title="Download address"
              >
                <Download size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                title="Open Simulator"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Bottom Collection Thumbnail Reel (Gondi signature carousel) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: '#18191e',
              borderRadius: 12,
              border: '1px solid #24252d',
              marginTop: 10,
            }}
          >
            <button
              type="button"
              onClick={() => router.push(`/request/${prevDeal.id}`)}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#22232a',
                border: '1px solid #2e303a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} />
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
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: isActive ? '2px solid #eab308' : '1px solid #2b2c35',
                      boxShadow: isActive ? '0 0 10px rgba(234, 179, 8, 0.4)' : 'none',
                      padding: 0,
                      background: '#121316',
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
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#22232a',
                border: '1px solid #2e303a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <ChevronRight size={14} />
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
              borderBottom: '1px solid #23242b',
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
                    borderBottom: activeTab === tab ? '2px solid #ffffff' : '2px solid transparent',
                    paddingBottom: 6,
                    fontSize: 13.5,
                    fontWeight: activeTab === tab ? 800 : 600,
                    color: activeTab === tab ? '#ffffff' : '#8a8b94',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab}
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
                background: '#1d1e24',
                border: '1px solid #282a33',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <LineChart size={13} />
              <span>Show Insights</span>
            </button>
          </div>

          {/* Activity Status Banner (like Gondi banner) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#18191e',
              border: '1px solid #24252d',
              padding: '9px 14px',
              borderRadius: 10,
              fontSize: 12,
              color: '#d1d2dd',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#30d158',
                  boxShadow: '0 0 6px #30d158',
                }}
              />
              <span>
                <b>{deal.token.name}</b> was funded 12 hours ago by <b>{deal.token.creatorAddress.slice(0, 6)}</b> from Pons Router for <b>0.1196 ETH</b>
              </span>
            </div>
            <span style={{ color: '#7a7b85', fontSize: 11 }}>Active onchain</span>
          </div>

          {/* Listing Info Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#7a7b85', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Listed for sale on GONDI / PONS</span>
              <span style={{ fontSize: 9.5, fontWeight: 800, background: '#1d2a1b', color: '#30d158', border: '1px solid #233a2a', padding: '1px 6px', borderRadius: 4 }}>
                NEW
              </span>
            </div>
            <div>
              2d : 11h : 24m : 18s
            </div>
          </div>

          {/* Dual Action Cards matching Gondi screenshot */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
              marginBottom: 20,
            }}
          >
            {/* Box 1: Buy Now Card */}
            <div
              style={{
                background: '#18191e',
                border: '1px solid #282932',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>
                    {remainingEth.toFixed(4)}
                  </span>
                  <span style={{ fontSize: 12, color: '#7a7b85' }}>
                    ${remainingFunding}
                  </span>
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
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {remainingFunding > 0 ? 'Buy Now' : 'Pool Filled'}
              </button>
            </div>

            {/* Box 2: Buy with Loan Card (Gondi signature green card) */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.16) 0%, rgba(18, 26, 21, 0.95) 100%)',
                color: '#ffffff',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(74, 222, 128, 0.35)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>
                      {(25 / ETH_PRICE_USD).toFixed(4)}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                      $25
                    </span>
                  </div>

                  {/* Dropdown pill */}
                  <div
                    style={{
                      background: 'rgba(20, 20, 24, 0.65)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 750,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{loanDuration}</span>
                    <ChevronDown size={12} />
                  </div>
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
                  background: '#22c55e',
                  color: '#052e16',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 850,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                }}
              >
                <span>Buy with Loan</span>
                <span style={{ fontSize: 10.5, fontWeight: 650, opacity: 0.9 }}>
                  Choose loan terms next · 11 offers
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Section 1: Traits */}
          <div
            style={{
              background: '#18191e',
              border: '1px solid #24252d',
              borderRadius: 12,
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
                padding: '12px 16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 750, fontSize: 13, color: '#ffffff' }}>
                {isTraitsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span>Traits</span>
              </div>
            </div>

            {isTraitsOpen && (
              <div
                style={{
                  padding: '0 16px 16px',
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
                      background: '#141416',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #23242a',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#7a7b85', textTransform: 'uppercase', fontWeight: 650 }}>
                      {trait.label}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 750, color: '#ffffff', marginTop: 2 }}>
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
              background: '#18191e',
              border: '1px solid #24252d',
              borderRadius: 12,
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
                padding: '12px 16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isBuyOffersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span style={{ fontWeight: 750, fontSize: 13, color: '#ffffff' }}>
                  Buy Offers
                </span>
                <span
                  style={{
                    background: '#22232a',
                    color: '#8a8b94',
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
                    background: '#ffffff',
                    color: '#000000',
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
                    background: '#22232a',
                    color: '#ffffff',
                    border: '1px solid #2e3038',
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
                <div style={{ display: 'flex', gap: 3, background: '#141416', padding: 2, borderRadius: 6 }}>
                  {(['All', 'ETH', 'USDC'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setOfferFilter(cur)}
                      style={{
                        background: offerFilter === cur ? '#22232a' : 'transparent',
                        color: offerFilter === cur ? '#ffffff' : '#7a7b85',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 7px',
                        fontSize: 10.5,
                        fontWeight: 700,
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
              <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #24252d', textAlign: 'left', color: '#7a7b85', fontSize: 11 }}>
                      <th style={{ padding: '8px 4px', fontWeight: 650 }}>Source</th>
                      <th style={{ padding: '8px 4px', fontWeight: 650 }}>Type</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Offer</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Net Proceeds</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Royalties & Fees</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: '0xhotw', type: 'Collection Offer', offer: '5.1000 ETH', net: '5.0745 ETH', fee: '0.50%', exp: '10 Oct 2026, 04:03' },
                      { source: '0xhotw', type: 'Collection Offer', offer: '5.0000 ETH', net: '4.9750 ETH', fee: '0.50%', exp: '27 Oct 2026, 21:55' },
                      { source: 'NFTPER_5', type: 'Item Offer', offer: '3.3600 ETH', net: '2.9904 ETH', fee: '11.00%', exp: '22m : 19s' },
                      { source: '0x88De...55f1', type: 'Pool Allocation', offer: '0.0100 ETH', net: '0.0099 ETH', fee: '0.50%', exp: '14 Oct 2026' },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2026' }}>
                        <td style={{ padding: '9px 4px', fontWeight: 700, color: '#ffffff' }}>
                          {row.source}
                        </td>
                        <td style={{ padding: '9px 4px', color: '#8a8b94' }}>
                          {row.type}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 800, color: '#ffffff' }}>
                          {row.offer}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#d1d2dd' }}>
                          {row.net}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#7a7b85' }}>
                          {row.fee}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#7a7b85' }}>
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
              background: '#18191e',
              border: '1px solid #24252d',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setIsLoanOffersOpen(!isLoanOffersOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isLoanOffersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span style={{ fontWeight: 750, fontSize: 13, color: '#ffffff' }}>
                  Loan Offers
                </span>
                <span
                  style={{
                    background: '#22232a',
                    color: '#8a8b94',
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
                    background: '#22232a',
                    color: '#ffffff',
                    border: '1px solid #2e3038',
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
                <div style={{ display: 'flex', gap: 3, background: '#141416', padding: 2, borderRadius: 6 }}>
                  {(['All', 'ETH', 'USDC'] as const).map((cur) => (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setLoanFilter(cur)}
                      style={{
                        background: loanFilter === cur ? '#22232a' : 'transparent',
                        color: loanFilter === cur ? '#ffffff' : '#7a7b85',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 7px',
                        fontSize: 10.5,
                        fontWeight: 700,
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
              <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #24252d', textAlign: 'left', color: '#7a7b85', fontSize: 11 }}>
                      <th style={{ padding: '8px 4px', fontWeight: 650 }}>Source</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Principal</th>
                      <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 650 }}>Duration</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>eAPR</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>APR</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Orig. Fee</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 650 }}>Loan Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: 'MISHARK', principal: '4.3000 ETH', duration: '30 D', eapr: '22.00%', apr: '15.00%', orig: '0.0244', cost: '0.0774' },
                      { source: 'trustlend.eth', principal: '10,000 USDC', duration: '30 D', eapr: '16.00%', apr: '6.00%', orig: '$81', cost: '$130' },
                      { source: 'trustlend.eth', principal: '10,000 USDC', duration: '30 D', eapr: '20.00%', apr: '10.00%', orig: '$80', cost: '$163' },
                      { source: '0xe35...85d', principal: '3.6000 ETH', duration: '7 D', eapr: '30.00%', apr: '15.00%', orig: '0.0103', cost: '0.0420' },
                      { source: 'botbotbot1', principal: '9,500 USDC', duration: '7 D', eapr: '35.00%', apr: '20.00%', orig: '$27', cost: '$68' },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2026' }}>
                        <td style={{ padding: '9px 4px', fontWeight: 700, color: '#ffffff' }}>
                          {row.source}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 800, color: '#ffffff' }}>
                          {row.principal}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'center', color: '#8a8b94' }}>
                          {row.duration}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#30d158', fontWeight: 800 }}>
                          {row.eapr}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#d1d2dd' }}>
                          {row.apr}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#7a7b85' }}>
                          {row.orig}
                        </td>
                        <td style={{ padding: '9px 4px', textAlign: 'right', color: '#7a7b85' }}>
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
