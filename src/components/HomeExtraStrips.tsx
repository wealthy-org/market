'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';

function shortAddr(a: string) {
  if (!a) return '-';
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export const EarnYieldBanner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px' }}>
      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Earn Yield</div>
      <Link
        href="/pools"
        style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--soft)', border: '1px solid var(--line)', fontSize: 12, fontWeight: 800, textDecoration: 'none', color: 'var(--ink)' }}
      >
        View Lending Market →
      </Link>
    </div>
  );
};

export const TopLendersStrip: React.FC = () => {
  const { activity, positions } = useMarket();

  const topLenders = useMemo(() => {
    const map = new Map<string, { totalUsd: number; count: number }>();
    for (const a of activity) {
      if (a.type !== 'CONTRIBUTION') continue;
      const usd = a.amountUsd ?? 0;
      if (usd <= 0) continue;
      const prev = map.get(a.userAddress) ?? { totalUsd: 0, count: 0 };
      prev.totalUsd += usd;
      prev.count += 1;
      map.set(a.userAddress, prev);
    }
    for (const p of positions) {
      const key = 'you (demo)';
      const prev = map.get(key) ?? { totalUsd: 0, count: 0 };
      prev.totalUsd += p.contributedUsd;
      prev.count += 1;
      map.set(key, prev);
    }
    return [...map.entries()]
      .map(([address, v]) => ({ address, ...v }))
      .sort((a, b) => b.totalUsd - a.totalUsd)
      .slice(0, 8);
  }, [activity, positions]);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <b style={{ fontSize: 13 }}>Top Lenders</b>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>24H</span>
      </div>
      <div style={{ display: 'flex', gap: 22, overflowX: 'auto', padding: '4px 2px 10px', scrollbarWidth: 'none', alignItems: 'center' }}>
        {topLenders.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>No contributions yet.</div>
        ) : (
          topLenders.map((l, i) => (
            <div key={l.address} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, width: 12 }}>{i + 1}</span>
              <span
                style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a1b18', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}
              >
                {l.address.replace('0x', '').replace('you (demo)', 'YOU').slice(0, 2).toUpperCase()}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{l.address === 'you (demo)' ? 'you' : shortAddr(l.address)}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap' }}>${l.totalUsd.toFixed(2).replace(/\.00$/, '')}</span>
              <span style={{ fontSize: 10, color: 'var(--line)' }}>◆</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const HomeExtraStrips: React.FC = () => {
  const { deals, openContributionModal } = useMarket();
  const [repayTab, setRepayTab] = useState<'Repaying' | 'Repaid' | 'All'>('Repaying');

  const repayingRows = useMemo(() => {
    let list = deals;
    if (repayTab === 'Repaying') list = deals.filter((d) => d.status === 'REPAYING' || (d.fundedUsd >= d.campaignTargetUsd && d.status !== 'REPAID'));
    if (repayTab === 'Repaid') list = deals.filter((d) => d.status === 'REPAID');
    return list.slice(0, 8);
  }, [deals, repayTab]);

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Repaying — full-width table like Gondi "Refinancing" */}
      <div className="gondi-table-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['Repaying', 'Repaid', 'All'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRepayTab(t)}
                style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', background: repayTab === t ? 'var(--ink)' : 'var(--soft)', color: repayTab === t ? '#fff' : 'var(--muted)', border: '1px solid var(--line)', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
              >
                {t}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>*payback projection, not guaranteed</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="gondi-table">
            <thead>
              <tr>
                <th>Items</th>
                <th>Payback*</th>
                <th style={{ textAlign: 'right' }}>Repaid</th>
                <th style={{ textAlign: 'right' }}>To cap</th>
                <th style={{ textAlign: 'center' }}>Cap progress</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {repayingRows.map((d) => {
                const capUsd = d.campaignTargetUsd * d.repayCapMultiplier;
                const remainingUsd = Math.max(0, capUsd - d.repaidToLendersUsd);
                const progressPct = Math.min(100, Math.round((d.repaidToLendersUsd / capUsd) * 100));
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {d.token.imageUrl ? (
                          <img src={d.token.imageUrl} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line-soft)' }} />
                        ) : (
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1a1b18', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                            {d.token.symbol.replace('$', '').slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12.5 }}>{d.token.symbol}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 700 }}>~{d.projectedPaybackHours}h</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 12.5 }}>${d.repaidToLendersUsd.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontSize: 12.5 }}>${remainingUsd.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ width: 90, margin: '0 auto' }}>
                        <div style={{ height: 6, background: 'var(--soft)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? 'var(--emerald)' : 'var(--ink)', borderRadius: 4 }} />
                        </div>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', marginTop: 3 }}>{progressPct}%</div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openContributionModal(d)}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--soft)', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Top-up
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {repayingRows.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--muted)' }}>Nothing here yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
