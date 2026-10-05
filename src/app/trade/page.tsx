'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';
import { 
  ArrowLeft, 
  ArrowDownUp, 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  CheckCircle2, 
  Zap, 
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TradePage() {
  const { deals, ethBalance } = useMarket();

  const [fromAmount, setFromAmount] = useState<string>('0.05');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('pny');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D'>('24H');

  const selectedDeal = deals.find((d) => d.id === selectedTokenId) || deals[0];
  const tokenRatePerEth = 34500 + (selectedDeal ? selectedDeal.campaignTargetUsd * 20 : 10000);
  const parsedFrom = parseFloat(fromAmount) || 0;
  const tokenOutput = (parsedFrom * tokenRatePerEth).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const usdValue = (parsedFrom * ETH_PRICE_USD).toFixed(2);
  const estimatedSplitterFeeUsd = (parsedFrom * ETH_PRICE_USD * 0.01).toFixed(2);
  const lenderFeeShareUsd = (parseFloat(estimatedSplitterFeeUsd) * 0.7).toFixed(2);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedFrom <= 0) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setSwapSuccess(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#a7ff63', '#11120f', '#58c939', '#eef8e9'],
        });
      } catch {
        // confetti fallback
      }
      setTimeout(() => setSwapSuccess(false), 3500);
    }, 1200);
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
            Pons V2 Trade &amp; DEX Liquidity · Robinhood Chain Testnet
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
                Pons V2 Trade
              </h1>
              <p style={{ color: 'var(--muted)', maxWidth: 640, fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
                Instant swaps with automated fee routing. Every trade generates trading fees routed
                through FinanceSplitter contracts to repay launch pool lenders until the 1.20× cap is met.
              </p>
            </div>

            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ padding: '10px 18px', fontSize: 13, textDecoration: 'none' }}
            >
              <span>Robinhood Explorer</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Gondi Style Stats Banner */}
        <div className="gondi-stats-banner" style={{ marginBottom: 28 }}>
          <div className="gondi-stat-card">
            <span className="label">24H DEX Volume</span>
            <div className="value-row">
              <span className="val">$184,920</span>
            </div>
            <span className="sub">Robinhood Chain AMM Swaps</span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Fees Routed (24H)</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--emerald)' }}>
                $1,849.20
              </span>
            </div>
            <span className="sub">70% directly streaming to lenders</span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Active Token Pairs</span>
            <div className="value-row">
              <span className="val">14 Pairs</span>
            </div>
            <span className="sub">Pons V2 Verified Pools</span>
          </div>

          <div className="gondi-stat-card">
            <span className="label">Gas Efficiency</span>
            <div className="value-row">
              <span className="val" style={{ color: 'var(--lime-dark)' }}>
                &lt; $0.0001
              </span>
            </div>
            <span className="sub">Sub-second testnet finality</span>
          </div>
        </div>

        {/* Main Swap & Chart Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 36,
          }}
        >
          {/* Interactive Swap Box */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: '0 8px 24px rgba(20, 20, 15, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowDownUp size={16} style={{ color: 'var(--ink)' }} />
                <b style={{ fontSize: 16, color: 'var(--ink)' }}>Pons Swap</b>
              </div>
              <span className="pill momentum" style={{ fontSize: 10 }}>
                Robinhood Testnet
              </span>
            </div>

            <form onSubmit={handleSwap}>
              {/* Pay Box */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>You pay</span>
                  <span>Balance: {ethBalance.toFixed(4)} ETH</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    style={{
                      border: 0,
                      outline: 'none',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--ink)',
                      width: '60%',
                      background: 'transparent',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--soft)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: 13,
                      color: 'var(--ink)',
                    }}
                  >
                    <span>Ξ</span>
                    <span>ETH</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  ≈ ${usdValue} USD
                </div>
              </div>

              {/* Receive Box */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>You receive</span>
                  <span>Estimated Output</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>
                    {tokenOutput}
                  </div>
                  <select
                    value={selectedTokenId}
                    onChange={(e) => setSelectedTokenId(e.target.value)}
                    style={{
                      background: 'var(--ink)',
                      color: '#ffffff',
                      border: 0,
                      outline: 'none',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  1 ETH ≈ {tokenRatePerEth.toLocaleString()} {selectedDeal.token.symbol}
                </div>
              </div>

              {/* Splitter Routing Transparency Callout */}
              <div
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 16,
                  fontSize: 12,
                  color: 'var(--ink)',
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Splitter Routing:</span>
                  <span style={{ fontWeight: 750 }}>FinanceSplitter.sol</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Estimated 1% Fee:</span>
                  <span style={{ fontWeight: 750 }}>${estimatedSplitterFeeUsd}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--emerald)' }}>→ 70% to Launch Lenders:</span>
                  <span style={{ fontWeight: 800, color: 'var(--emerald)' }}>+${lenderFeeShareUsd}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn lime"
                disabled={isSwapping}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 850,
                  justifyContent: 'center',
                }}
              >
                {isSwapping ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Routing Swap via Pons V2...</span>
                  </>
                ) : swapSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Swap Confirmed on Robinhood Chain!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Swap ETH for {selectedDeal.token.symbol}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Chart & Market Depth View */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              boxShadow: '0 8px 24px rgba(20, 20, 15, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#1a1b18',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    {selectedDeal.token.symbol.replace('$', '').slice(0, 3)}
                  </div>
                  <div>
                    <b style={{ fontSize: 15, color: 'var(--ink)' }}>{selectedDeal.token.symbol} / ETH</b>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Robinhood Testnet Pool</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  {(['1H', '24H', '7D'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: timeframe === tf ? 'var(--ink)' : '#ffffff',
                        color: timeframe === tf ? '#ffffff' : 'var(--ink)',
                        border: '1px solid var(--line)',
                        fontSize: 11,
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Metric */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)' }}>
                  $0.00{selectedDeal.fundedUsd}24
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--emerald)' }}>
                  +{selectedDeal.feeVelocityTrend}% ({timeframe})
                </div>
              </div>

              {/* Stylized Simulated Chart */}
              <div
                style={{
                  height: 140,
                  width: '100%',
                  background: 'linear-gradient(180deg, rgba(167, 255, 99, 0.15) 0%, rgba(167, 255, 99, 0) 100%)',
                  borderRadius: 12,
                  border: '1px solid var(--line-soft)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 8,
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 300 100"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <path
                    d="M 0,80 Q 50,60 100,75 T 200,35 T 300,15"
                    fill="none"
                    stroke="var(--emerald)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'relative', zIndex: 1, fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>
                  Volume: $42,100 ({timeframe})
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Splitter contract holds fee rights until 1.20× cap is satisfied. Traders support creator growth while lenders earn automatic returns.
              </div>
            </div>
          </div>
        </div>

        {/* Live Liquidity Pools Table */}
        <div className="gondi-table-box" style={{ marginBottom: 40 }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <b style={{ fontSize: 14, color: 'var(--ink)' }}>POOLS &amp; TRADING PAIRS</b>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Robinhood Chain Testnet AMM</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="gondi-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th>Trading Pair</th>
                  <th style={{ textAlign: 'right' }}>Price (USD)</th>
                  <th style={{ textAlign: 'right' }}>24H Change</th>
                  <th style={{ textAlign: 'right' }}>24H Fee Velocity</th>
                  <th style={{ textAlign: 'right' }}>70% Lender Stream</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal, idx) => (
                  <tr key={deal.id}>
                    <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
                      {idx + 1}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#1a1b18',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 11,
                          }}
                        >
                          {deal.token.symbol.replace('$', '').slice(0, 3)}
                        </div>
                        <div>
                          <b style={{ fontSize: 13, color: 'var(--ink)' }}>{deal.token.symbol} / ETH</b>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{deal.token.name}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        ${(deal.fundedUsd / 10000).toFixed(4)}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                        +{deal.feeVelocityTrend}%
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                        ${deal.feeVelocity}/hr
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                        ${(deal.feeVelocity * 0.7).toFixed(2)}/hr
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTokenId(deal.id)}
                        className="btn lime"
                        style={{ padding: '5px 12px', fontSize: 11.5, fontWeight: 800 }}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Live Activity Stream */}
      <GondiActivityFeed />
    </div>
  );
}
