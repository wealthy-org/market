'use client';

import React from 'react';
import { useMarket } from '@/context/MarketContext';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { deals, openContributionModal, setIsCreateModalOpen, contributeToPool } = useMarket();
  const ponyDeal = deals.find((d) => d.id === 'pny') || deals[0];

  const handleHeroFund = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = contributeToPool(ponyDeal.id, 25);
    if (result.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#a7ff63', '#11120f', '#ffffff'],
        });
      } catch {
        // Confetti optional
      }
    }
  };

  const pct = Math.min(100, Math.round((ponyDeal.fundedUsd / ponyDeal.campaignTargetUsd) * 100));

  return (
    <section className="hero">
      <div>
        <div className="eyebrow">Creator fee financing · Pons V2</div>
        <h1 className="serif-heading">Fund what’s moving.</h1>
        <p>
          Back live token launches with small pooled contributions. Campaign costs
          are funded upfront, then repaid automatically from future creator fees.
        </p>

        <div className="hero-cta">
          <a className="btn dark" href="#market">
            <span>Browse live requests</span>
            <ArrowRight size={14} />
          </a>
          <button
            type="button"
            className="btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create a request
          </button>
        </div>

        <div className="hero-meta">
          <div>
            <b>38</b>
            <span>funded today</span>
          </div>
          <div>
            <b>11.4h</b>
            <span>median payback*</span>
          </div>
          <div>
            <b>4.2 ETH</b>
            <span>deployed today</span>
          </div>
        </div>
      </div>

      <aside className="live-card" onClick={() => openContributionModal(ponyDeal)} style={{ cursor: 'pointer' }}>
        <div className="livehead">
          <div className="dot">Live request</div>
          <div className="eyebrow" style={{ fontSize: 9.5 }}>
            Pons · {ponyDeal.token.age} old
          </div>
        </div>

        <div className="request-box">
          <div className="token-row">
            <div className="token-left">
              {ponyDeal.token.imageUrl ? (
                <img
                  src={ponyDeal.token.imageUrl}
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    objectFit: 'cover',
                    background: '#1a1b18',
                    border: '1px solid var(--line)',
                  }}
                />
              ) : (
                <div className="avatar">{ponyDeal.token.avatar}</div>
              )}
              <div>
                <b style={{ fontSize: 16 }}>{ponyDeal.token.symbol}</b>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>
                  {ponyDeal.token.address}
                </small>
              </div>
            </div>
            <div className="pill">Momentum</div>
          </div>

          <div className="grid3">
            <div className="stat-box">
              <small>Fee velocity</small>
              <b>${ponyDeal.feeVelocity}/hr</b>
            </div>
            <div className="stat-box">
              <small>Liquidity</small>
              <b>${(ponyDeal.liquidityUsd / 1000).toFixed(1)}K</b>
            </div>
            <div className="stat-box">
              <small>Traders</small>
              <b>{ponyDeal.uniqueTraders}</b>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 18,
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{ponyDeal.campaignName}</span>
            <b style={{ fontSize: 14 }}>${ponyDeal.campaignTargetUsd}</b>
          </div>

          <div className="progress-track">
            <i
              className="progress-fill"
              style={{
                width: `${pct}%`,
              }}
            />
          </div>

          <div className="row-spread">
            <span>
              {ponyDeal.fundedUsd >= ponyDeal.campaignTargetUsd
                ? 'Fully funded'
                : `$${ponyDeal.fundedUsd} funded (${pct}%)`}
            </span>
            <span>${ponyDeal.campaignTargetUsd} target</span>
          </div>

          <button
            type="button"
            className="btn lime"
            style={{ width: '100%', marginTop: 16, padding: '12px' }}
            onClick={handleHeroFund}
          >
            <Sparkles size={14} />
            <span>Fund this pool (+$25)</span>
          </button>
        </div>
      </aside>
    </section>
  );
};
