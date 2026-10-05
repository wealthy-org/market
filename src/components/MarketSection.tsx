'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';

import { DealStatus, FundingDeal } from '@/types/market';
import { ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';

const TABS: { label: string; value: string }[] = [
  { label: 'Live', value: 'ALL_LIVE' },
  { label: 'Momentum', value: 'MOMENTUM' },
  { label: 'Hot', value: 'HOT' },
  { label: 'Recently funded', value: 'RECENTLY_FUNDED' },
  { label: 'Repaying', value: 'REPAYING' },
  { label: 'Repaid', value: 'REPAID' },
];

export const MarketSection: React.FC = () => {
  const { deals, setSelectedDealId, selectedDeal, openContributionModal } = useMarket();
  const [activeTab, setActiveTab] = useState<string>('ALL_LIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDeals = deals.filter((deal) => {
    // Filter by tab
    if (activeTab === 'ALL_LIVE') {
      if (deal.status === 'REPAID') return false;
    } else if (activeTab === 'RECENTLY_FUNDED') {
      if (deal.status !== 'RECENTLY_FUNDED' && deal.status !== 'REPAYING') return false;
    } else if (deal.status !== activeTab) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        deal.token.symbol.toLowerCase().includes(q) ||
        deal.token.name.toLowerCase().includes(q) ||
        deal.token.address.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleRowClick = (deal: FundingDeal) => {
    setSelectedDealId(deal.id);
    const element = document.getElementById('deal');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFundClick = (e: React.MouseEvent, deal: FundingDeal) => {
    e.stopPropagation();
    openContributionModal(deal);
  };

  return (
    <section className="section" id="market">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">01 / Live market</div>
          <div>
            <h2 className="serif-heading">New requests move fast.</h2>
            <p className="section-copy">
              Each request has one exact campaign target. Multiple lenders can enter the same
              pool. When the cost is fully covered, the pool closes and campaign execution starts.
            </p>
          </div>
        </div>

        <div className="market-box">
          <div className="market-top">
            <div className="tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`tab ${activeTab === tab.value ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input
                type="text"
                placeholder="Search $TOKEN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  outline: 'none',
                  width: 140,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: 'var(--muted)',
                  fontWeight: 700,
                }}
              >
                <Radio size={12} color="#58c939" style={{ animation: 'pulse-dot 2s infinite' }} />
                <span>Auto-refreshing</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredDeals.map((deal) => {
              const isSelected = selectedDeal.id === deal.id;
              const isFilled = deal.fundedUsd >= deal.campaignTargetUsd;

              return (
                <div
                  key={deal.id}
                  className="deal-row"
                  onClick={() => handleRowClick(deal)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.95)' : undefined,
                    boxShadow: isSelected ? 'inset 3px 0 0 var(--lime)' : undefined,
                  }}
                >
                  <div className="mini-token">
                    {deal.token.imageUrl ? (
                      <img
                        src={deal.token.imageUrl}
                        alt={deal.token.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          objectFit: 'cover',
                          background: '#1a1b18',
                          border: '1px solid var(--line)',
                        }}
                      />
                    ) : (
                      <div className="mini-avatar">{deal.token.avatar}</div>
                    )}
                    <div>
                      <b style={{ fontSize: 14 }}>{deal.token.symbol}</b>
                      <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                        {deal.token.age} · Pons V2
                      </small>
                    </div>
                  </div>

                  <div>
                    <span className="label">Fee velocity</span>
                    <span className={`value ${deal.trendDirection === 'up' ? 'up' : 'down'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      ${deal.feeVelocity}/hr
                      {deal.trendDirection === 'up' ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="label">Pool</span>
                    <span className="value">
                      ${deal.fundedUsd} / ${deal.campaignTargetUsd}
                    </span>
                  </div>

                  <div>
                    <span className="label">Lender share</span>
                    <span className="value">{deal.lenderFeeSharePct}%</span>
                  </div>

                  <div>
                    <span className="label">Repay cap</span>
                    <span className="value">{deal.repayCapMultiplier.toFixed(2)}×</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link
                      href={`/request/${deal.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid var(--line)',
                        background: '#ffffff',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      View
                    </Link>

                    {isFilled ? (
                      <button
                        type="button"
                        className="fund-btn filled"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(deal);
                        }}
                      >
                        {deal.status === 'REPAID' ? 'Repaid' : 'Filled'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="fund-btn"
                        onClick={(e) => handleFundClick(e, deal)}
                      >
                        Fund
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredDeals.length === 0 && (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                No active pools matching &quot;{activeTab}&quot; or filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
