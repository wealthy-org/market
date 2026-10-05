'use client';

import React, { useState } from 'react';
import { X, Calculator, ArrowRight, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { FundingDeal } from '@/types/market';
import { ETH_PRICE_USD } from '@/data/mockDeals';

interface PaybackCalculatorModalProps {
  deal: FundingDeal | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFundModal?: (deal: FundingDeal) => void;
}

export const PaybackCalculatorModal: React.FC<PaybackCalculatorModalProps> = ({
  deal,
  isOpen,
  onClose,
  onOpenFundModal,
}) => {
  if (!isOpen || !deal) return null;

  // Sliders state
  const [dailyVolumeUsd, setDailyVolumeUsd] = useState<number>(35000);
  const [dexFeePct, setDexFeePct] = useState<number>(1.0); // 1% typical memecoin DEX fee
  const [investmentUsd, setInvestmentUsd] = useState<number>(50);

  // Calculations
  const totalDailyDexFees = dailyVolumeUsd * (dexFeePct / 100);
  const lenderStreamPct = deal.lenderFeeSharePct / 100; // e.g. 0.70
  const dailyLenderFees = totalDailyDexFees * lenderStreamPct;

  const targetCampaignUsd = deal.campaignTargetUsd; // $299
  const repayCapUsd = targetCampaignUsd * deal.repayCapMultiplier; // $358.80

  // Days to 100% full campaign payback and 1.20x cap
  const daysToFullRepay = dailyLenderFees > 0 ? repayCapUsd / dailyLenderFees : 0;
  const hoursToFullRepay = daysToFullRepay * 24;

  // User investment return
  const userSharePct = Math.min(100, (investmentUsd / targetCampaignUsd) * 100);
  const userTargetCapReturnUsd = investmentUsd * deal.repayCapMultiplier; // 1.20x
  const userNetProfitUsd = userTargetCapReturnUsd - investmentUsd;

  // Annualized Yield Projection (APR)
  const paybackDays = Math.max(0.2, daysToFullRepay);
  const annualizedRoiPct = ((0.20 / paybackDays) * 365 * 100).toFixed(0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(17, 18, 15, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'var(--soft)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#1a1b18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--lime)',
            }}
          >
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>
              Pons V2 Repayment Simulator
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0', color: 'var(--ink)' }}>
              1.20x Yield & Payback Model
            </h3>
          </div>
        </div>

        {/* Token Context Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--soft)',
            padding: '10px 14px',
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {deal.token.imageUrl && (
              <img
                src={deal.token.imageUrl}
                alt={deal.token.name}
                style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }}
              />
            )}
            <b style={{ color: 'var(--ink)' }}>{deal.token.name} ({deal.token.symbol})</b>
          </div>
          <span style={{ color: 'var(--muted)' }}>
            Campaign: <b>${deal.campaignTargetUsd}</b> · Split: <b>{deal.lenderFeeSharePct}% Lenders</b>
          </span>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
          {/* Daily DEX Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Expected Daily DEX Volume</span>
              <b style={{ color: 'var(--ink)' }}>${dailyVolumeUsd.toLocaleString()} / day</b>
            </div>
            <input
              type="range"
              min="5000"
              max="250000"
              step="5000"
              value={dailyVolumeUsd}
              onChange={(e) => setDailyVolumeUsd(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lime)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
              <span>$5,000 (Low)</span>
              <span>$50,000 (Normal)</span>
              <span>$250,000 (High Momentum)</span>
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Your Contribution (Lender Principal)</span>
              <b style={{ color: 'var(--ink)' }}>${investmentUsd} ({(investmentUsd / ETH_PRICE_USD).toFixed(4)} ETH)</b>
            </div>
            <input
              type="range"
              min="10"
              max={deal.campaignTargetUsd}
              step="5"
              value={investmentUsd}
              onChange={(e) => setInvestmentUsd(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--lime)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
              <span>$10 min</span>
              <span>Pool Share: {userSharePct.toFixed(1)}%</span>
              <span>${deal.campaignTargetUsd} (Max 100%)</span>
            </div>
          </div>
        </div>

        {/* Calculated Results Card */}
        <div
          style={{
            background: '#1a1b18',
            color: '#ffffff',
            borderRadius: 16,
            padding: '18px 20px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>
                Est. Payback Speed
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--lime)', marginTop: 2 }}>
                {daysToFullRepay < 1
                  ? `${hoursToFullRepay.toFixed(1)} Hours`
                  : `${daysToFullRepay.toFixed(1)} Days`}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>
                To full 1.20x Cap Hit
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>
                Your Guaranteed Return
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                ${userTargetCapReturnUsd.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--lime)' }}>
                +${userNetProfitUsd.toFixed(2)} Net (+20.0% ROI)
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 12,
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="var(--lime)" />
              <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Annualized Velocity (APR):</span>
            </div>
            <b style={{ color: 'var(--lime)', fontSize: 14 }}>{annualizedRoiPct}% APR</b>
          </div>
        </div>

        {/* Mechanism Guarantee Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 11.5,
            color: 'var(--muted)',
            lineHeight: 1.45,
            marginBottom: 20,
          }}
        >
          <ShieldCheck size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <b>Onchain Security Guarantee:</b> Pool repayments are automated by the <code>FinanceSplitter</code> contract. 70% of LP creator trading fees flow directly to lenders until 1.20x is repaid, after which fee rights automatically return to the creator.
          </span>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--soft)',
              border: '1px solid var(--line)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            Close Simulator
          </button>
          {onOpenFundModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFundModal(deal);
              }}
              style={{
                flex: 1.4,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'var(--ink)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>Fund ${investmentUsd} into Pool</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
