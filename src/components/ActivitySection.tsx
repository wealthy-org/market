'use client';

import React from 'react';
import { useMarket } from '@/context/MarketContext';
import { Activity, ArrowUpRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const ActivitySection: React.FC = () => {
  const { activity } = useMarket();

  return (
    <section className="section" id="activity">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">04 / Activity</div>
          <div>
            <h2 className="serif-heading">A market that recycles capital.</h2>
            <p className="section-copy">
              Successful repayments return capital to lenders, creating a reason to keep watching
              the next live request. Track real-time funding escrow and fee distribution events on
              Robinhood Chain.
            </p>
          </div>
        </div>

        {/* Protocol High-Level Metrics */}
        <div className="metrics-grid">
          <div className="metric-cell">
            <small>Funded today</small>
            <b>38</b>
          </div>
          <div className="metric-cell">
            <small>Capital deployed</small>
            <b>4.2 ETH</b>
          </div>
          <div className="metric-cell">
            <small>Repaid to lenders</small>
            <b>3.7 ETH</b>
          </div>
          <div className="metric-cell">
            <small>Median payback</small>
            <b>11.4h</b>
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="activity-feed">
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--line-soft)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 750 }}>
              <Activity size={16} color="var(--ink)" />
              <span>Live Onchain Activity Feed</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
              Pons V2 Fee Router · Robinhood Chain
            </span>
          </div>

          <div>
            {activity.slice(0, 6).map((item) => (
              <div key={item.id} className="activity-row">
                <div className="activity-left">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background:
                        item.type === 'REPAYMENT'
                          ? 'var(--green-bg)'
                          : item.type === 'POOL_FILLED'
                          ? 'var(--lime)'
                          : 'var(--soft)',
                      color:
                        item.type === 'REPAYMENT'
                          ? 'var(--green-accent)'
                          : 'var(--ink)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {item.tokenAvatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 750, color: 'var(--ink)' }}>
                      {item.details}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                      <span>User: {item.userAddress}</span>
                      <span>•</span>
                      <span>Tx: {item.txHash}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {item.amountUsd && (
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      +${item.amountUsd.toFixed(2)}
                      {item.amountEth && (
                        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
                          ({item.amountEth} ETH)
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted-light)', marginTop: 2 }}>
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
