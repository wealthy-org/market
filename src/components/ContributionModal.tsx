'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import confetti from 'canvas-confetti';
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const ContributionModal: React.FC = () => {
  const { isContributionModalOpen, modalDeal, closeContributionModal, contributeToPool } = useMarket();
  const [amount, setAmount] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isContributionModalOpen || !modalDeal) return null;

  const remaining = Math.max(0, modalDeal.campaignTargetUsd - modalDeal.fundedUsd);
  const finalAmount = Math.min(amount, remaining);
  const ethEquivalent = +(finalAmount / ETH_PRICE_USD).toFixed(4);
  const poolShare = +((finalAmount / modalDeal.campaignTargetUsd) * 100).toFixed(2);
  const maxRepayment = +(finalAmount * modalDeal.repayCapMultiplier).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = contributeToPool(modalDeal.id, finalAmount);
      setIsSubmitting(false);
      if (res.success) {
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#a7ff63', '#11120f', '#eef8e9'],
          });
        } catch {
          // confetti optional
        }
        setTimeout(() => {
          setIsSuccess(false);
          closeContributionModal();
        }, 1800);
      }
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={closeContributionModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={closeContributionModal}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="avatar">{modalDeal.token.avatar}</div>
          <div>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>
              Pool Contribution
            </div>
            <h3 className="serif-heading" style={{ fontSize: 24, margin: '2px 0 0' }}>
              Fund {modalDeal.token.symbol} Launch
            </h3>
          </div>
        </div>

        <div
          style={{
            background: 'var(--soft)',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Campaign</span>
            <b>{modalDeal.campaignName}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Pool Progress</span>
            <b>
              ${modalDeal.fundedUsd} / ${modalDeal.campaignTargetUsd} (
              {Math.round((modalDeal.fundedUsd / modalDeal.campaignTargetUsd) * 100)}%)
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Fee Velocity</span>
            <b style={{ color: 'var(--green-accent)' }}>${modalDeal.feeVelocity}/hr</b>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
            CHOOSE ALLOCATION AMOUNT
          </div>

          <div className="allocation-presets">
            {[10, 25, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                className={`preset-chip ${amount === val ? 'active' : ''}`}
                onClick={() => setAmount(val)}
              >
                ${val}
              </button>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                className={`preset-chip ${amount === remaining ? 'active' : ''}`}
                onClick={() => setAmount(remaining)}
              >
                Max (${remaining})
              </button>
            )}
          </div>

          <div className="allocation-box" style={{ margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--muted)' }}>$</span>
              <input
                type="number"
                min="1"
                max={remaining || 1}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>≈ {ethEquivalent} ETH</span>
            </div>
          </div>

          {/* Deal calculations */}
          <div
            style={{
              border: '1px solid var(--line-soft)',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'grid',
              gap: 8,
              fontSize: 12.5,
              marginBottom: 20,
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Pool ownership</span>
              <b>{poolShare}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Lender fee share</span>
              <b>{modalDeal.lenderFeeSharePct}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Maximum repayment* ({modalDeal.repayCapMultiplier}× cap)</span>
              <b style={{ color: 'var(--green-accent)' }}>${maxRepayment}</b>
            </div>
          </div>

          {isSuccess ? (
            <button
              type="button"
              className="bigfund-btn"
              style={{ background: '#58c939', color: '#fff' }}
              disabled
            >
              <CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Confirmed on Robinhood Chain!
            </button>
          ) : (
            <button
              type="submit"
              className="bigfund-btn"
              disabled={isSubmitting || remaining <= 0}
            >
              {isSubmitting ? (
                'Confirming Transaction...'
              ) : (
                <>
                  <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Confirm Funding ${finalAmount} ({ethEquivalent} ETH)
                </>
              )}
            </button>
          )}

          <div className="risk-note" style={{ textAlign: 'center', marginTop: 12 }}>
            <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            *Maximum if the deal fully repays. Not guaranteed. Pro-rata repayment streamed from Pons creator fees.
          </div>
        </form>
      </div>
    </div>
  );
};
