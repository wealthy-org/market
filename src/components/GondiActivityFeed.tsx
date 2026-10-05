'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { Filter } from 'lucide-react';

export const GondiActivityFeed: React.FC = () => {
  const { activity, deals, setSelectedDealId } = useMarket();
  const [activeTab, setActiveTab] = useState<'All Activity' | 'Following'>('All Activity');
  const [subTab, setSubTab] = useState<'Feed' | 'Top Repayments' | 'Pool Fills'>('Feed');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);

  // Filter activities
  const filteredActivity = activity.filter((item) => {
    const usd = item.amountUsd ?? (item.amountEth ? item.amountEth * ETH_PRICE_USD : 0);
    if (filterThreshold > 0 && usd < filterThreshold) return false;
    if (subTab === 'Top Repayments') return item.type === 'REPAYMENT';
    if (subTab === 'Pool Fills') return item.type === 'POOL_FILLED' || item.type === 'CONTRIBUTION';
    return true;
  });

  return (
    <aside className="gondi-activity-column">
      {/* Top Main Tabs: All Activity / Following */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg)',
          padding: '12px 14px',
          gap: 6,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('All Activity')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'All Activity' ? 'var(--surface-elevated)' : 'transparent',
            color: activeTab === 'All Activity' ? '#ffffff' : 'var(--muted)',
            border: 0,
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          All Activity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('Following')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'Following' ? 'var(--surface-elevated)' : 'transparent',
            color: activeTab === 'Following' ? '#ffffff' : 'var(--muted)',
            border: 0,
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span>★</span>
          <span>Following</span>
        </button>
      </div>

      {/* Subtabs & Filter: Feed / Top Repayments / Pool Fills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--line)',
          background: '#121518',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {(['Feed', 'Top Repayments', 'Pool Fills'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSubTab(tab)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: subTab === tab ? 'var(--surface-elevated)' : 'transparent',
                color: subTab === tab ? 'var(--ink)' : 'var(--muted)',
                border: 0,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'Top Repayments' ? 'Repayments' : tab === 'Pool Fills' ? 'Fills' : 'Feed'}
            </button>
          ))}
        </div>

        {/* Filter threshold badge */}
        <button
          type="button"
          onClick={() => setFilterThreshold((prev) => (prev === 0 ? 50 : 0))}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: filterThreshold > 0 ? 'var(--surface-elevated)' : 'transparent',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 8px',
            fontSize: 10.5,
            fontWeight: 700,
            color: filterThreshold > 0 ? 'var(--lime)' : 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          <Filter size={10} />
          <span>{filterThreshold > 0 ? '> $50' : 'All'}</span>
        </button>
      </div>

      {/* Feed List Items (scrollable) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {filteredActivity.map((item) => {
          const matchingDeal = deals.find((d) => d.id === item.dealId);
          const ethAmount = item.amountEth != null 
            ? item.amountEth.toFixed(4)
            : item.amountUsd != null
            ? (item.amountUsd / ETH_PRICE_USD).toFixed(4)
            : '0.0000';

          // Type label & color
          let typeLabel = 'Funded';
          let typeColor = 'var(--emerald)';
          if (item.type === 'REPAYMENT') {
            typeLabel = 'Repaid';
            typeColor = 'var(--lime)';
          } else if (item.type === 'POOL_FILLED') {
            typeLabel = 'Filled';
            typeColor = '#60a5fa';
          } else if (item.type === 'CAMPAIGN_EXECUTED') {
            typeLabel = 'Executed';
            typeColor = '#f59e0b';
          }

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.dealId) {
                  setSelectedDealId(item.dealId);
                  const el = document.getElementById('deal-detail');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-card)',
                border: '1px solid var(--line-soft)',
                cursor: 'pointer',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.borderColor = 'var(--line-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-card)';
                e.currentTarget.style.borderColor = 'var(--line-soft)';
              }}
            >
              {/* Left: Avatar + Title & Addresses */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#161b20',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 11,
                    color: typeColor,
                    flexShrink: 0,
                  }}
                >
                  {item.tokenSymbol ? item.tokenSymbol.replace('$', '').slice(0, 3) : '✦'}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 750,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.details || matchingDeal?.token.name || item.tokenSymbol}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{item.userAddress ? `${item.userAddress.slice(0, 6)}...` : '0xPool'}</span>
                    <span style={{ opacity: 0.5 }}>→</span>
                    <span>Pons Escrow</span>
                  </div>
                </div>
              </div>

              {/* Right: Amount & Badge */}
              <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ffffff' }}>
                  {ethAmount} <span style={{ fontSize: 9.5, color: 'var(--muted)' }}>ETH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 750,
                      color: typeColor,
                    }}
                  >
                    {typeLabel}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{item.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Ticker matching Gondi */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--line)',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span>Live WebSocket Feed</span>
        </div>
        <span style={{ fontWeight: 700, color: 'var(--ink)' }}>70% Fee Split</span>
      </div>
    </aside>
  );
};
