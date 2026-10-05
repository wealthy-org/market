'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ArrowUpRight, Filter, ExternalLink, Activity as ActivityIcon } from 'lucide-react';

export default function ActivityPage() {
  const { activity } = useMarket();
  const [filterType, setFilterType] = useState<'ALL' | 'CONTRIBUTION' | 'REPAYMENT' | 'POOL_FILLED'>('ALL');

  const filtered = activity.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed" style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="pill momentum" style={{ fontSize: 11 }}>Live Stream</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 650 }}>Pons V2 + Robinhood Chain</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 34,
                fontWeight: 400,
                color: 'var(--ink)',
                letterSpacing: '-0.04em',
                marginBottom: 6,
              }}
            >
              Protocol Activity
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 640 }}>
              Live real-time feed of lender contributions, 75% fee router repayments, DEX Screener campaign fills, and repayment completions.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--soft)', padding: 3, borderRadius: 'var(--radius-full)', border: '1px solid var(--line)' }}>
            {[
              { id: 'ALL', label: 'All Activity' },
              { id: 'CONTRIBUTION', label: 'Fundings' },
              { id: 'REPAYMENT', label: 'Repayments' },
              { id: 'POOL_FILLED', label: 'Fills' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: 0,
                  background: filterType === tab.id ? 'var(--ink)' : 'transparent',
                  color: filterType === tab.id ? '#ffffff' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Table */}
        <div className="gondi-table-box">
          <table className="gondi-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Event</th>
                <th>Pool / Token</th>
                <th>Details</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right', width: 130 }}>Time</th>
                <th style={{ textAlign: 'center', width: 60 }}>Tx</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span
                      className="pill"
                      style={{
                        background:
                          item.type === 'REPAYMENT'
                            ? 'rgba(64, 121, 44, 0.12)'
                            : item.type === 'POOL_FILLED'
                            ? 'rgba(167, 255, 99, 0.25)'
                            : 'var(--soft)',
                        color:
                          item.type === 'REPAYMENT'
                            ? '#40792c'
                            : item.type === 'POOL_FILLED'
                            ? '#18310a'
                            : 'var(--ink)',
                        fontSize: 10.5,
                        fontWeight: 800,
                      }}
                    >
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={item.dealId ? `/request/${item.dealId}` : '#'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'var(--soft)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.tokenSymbol} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          item.tokenAvatar || item.tokenSymbol.slice(0, 3)
                        )}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>{item.tokenSymbol}</span>
                    </Link>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--muted)', maxWidth: 420 }}>
                    {item.details}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.amountEth !== undefined && (
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                        {item.amountEth.toFixed(4)} <span style={{ fontSize: 10, color: 'var(--muted)' }}>ETH</span>
                      </div>
                    )}
                    {item.amountUsd !== undefined && (
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        ${item.amountUsd.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {item.timestamp}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <a
                      href="https://robinhoodchain.blockscout.com"
                      target="_blank"
                      rel="noreferrer"
                      title={item.txHash}
                      style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
