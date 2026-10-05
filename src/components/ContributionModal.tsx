'use client';

import React, { useState, useEffect } from 'react';
import { useMarket } from '@/context/MarketContext';
import { ETH_PRICE_USD } from '@/data/mockDeals';
import { useAccount, useChainId } from 'wagmi';
import { useContributeToPool } from '@/hooks/useFundingProtocol';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import confetti from 'canvas-confetti';
import { X, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const ContributionModal: React.FC = () => {
  const { isContributionModalOpen, modalDeal, closeContributionModal, contributeToPool } = useMarket();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  const [amount, setAmount] = useState<number>(25);
  const [localSubmitting, setLocalSubmitting] = useState<boolean>(false);
  const [localSuccess, setLocalSuccess] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Target pool contract address
  const targetPoolAddress = (modalDeal?.poolContractAddress || CONTRACT_ADDRESSES.samplePool) as `0x${string}`;

  // Wagmi contract hook
  const { 
    contribute, 
    hash, 
    isPending: isContractPending, 
    isConfirming, 
    isSuccess: isContractSuccess, 
    error: contractError,
    reset: resetContract 
  } = useContributeToPool(targetPoolAddress);

  // Reset states when modal opens
  useEffect(() => {
    if (isContributionModalOpen) {
      setLocalSuccess(false);
      setCustomError(null);
      resetContract();
    }
  }, [isContributionModalOpen, resetContract]);

  // Handle contract success
  useEffect(() => {
    if (isContractSuccess && modalDeal) {
      setLocalSuccess(true);
      contributeToPool(modalDeal.id, amount, hash);
      triggerConfetti();
      const timer = setTimeout(() => {
        closeContributionModal();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isContractSuccess, modalDeal, hash, amount, contributeToPool, closeContributionModal]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#a7ff63', '#11120f', '#eef8e9', '#58c939'],
      });
    } catch {
      // confetti fallback
    }
  };

  if (!isContributionModalOpen || !modalDeal) return null;

  const remaining = Math.max(0, modalDeal.campaignTargetUsd - modalDeal.fundedUsd);
  const finalAmount = Math.min(amount, remaining);
  const ethEquivalent = +(finalAmount / ETH_PRICE_USD).toFixed(4);
  const poolShare = +((finalAmount / modalDeal.campaignTargetUsd) * 100).toFixed(2);
  const maxRepayment = +(finalAmount * modalDeal.repayCapMultiplier).toFixed(2);

  const isProcessing = isContractPending || isConfirming || localSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;
    setCustomError(null);

    // If wallet connected, execute real onchain contribution!
    if (isConnected) {
      try {
        await contribute(ethEquivalent.toString());
      } catch (err: any) {
        console.warn('Onchain contribute error or rejected:', err);
        // If user rejected or on unsupported chain, offer fallback or show error
        if (err?.message?.includes('User rejected') || err?.message?.includes('denied')) {
          setCustomError('Transaction rejected in wallet.');
        } else {
          // If contract call failed (e.g. mock testnet RPC not reachable), allow seamless local simulation
          setCustomError(err?.shortMessage || err?.message || 'Contract transaction failed');
        }
      }
    } else {
      // Wallet not connected -> simulate in demo context
      setLocalSubmitting(true);
      setTimeout(() => {
        const res = contributeToPool(modalDeal.id, finalAmount);
        setLocalSubmitting(false);
        if (res.success) {
          setLocalSuccess(true);
          triggerConfetti();
          setTimeout(() => {
            setLocalSuccess(false);
            closeContributionModal();
          }, 2000);
        }
      }, 600);
    }
  };

  const handleSimulateFallback = () => {
    setLocalSubmitting(true);
    setCustomError(null);
    setTimeout(() => {
      contributeToPool(modalDeal.id, finalAmount);
      setLocalSubmitting(false);
      setLocalSuccess(true);
      triggerConfetti();
      setTimeout(() => {
        setLocalSuccess(false);
        closeContributionModal();
      }, 2000);
    }, 500);
  };

  const explorerBase = chainId === 4663 
    ? 'https://robinhoodchain.blockscout.com' 
    : 'https://robinhoodchain.blockscout.com';

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
              Launch Pool · {isConnected ? 'Onchain Mode' : 'Prototype Simulation'}
            </div>
            <h3 className="serif-heading" style={{ fontSize: 24, margin: '2px 0 0' }}>
              Fund {modalDeal.token.symbol} Launch
            </h3>
          </div>
        </div>

        {/* Pool Summary Box */}
        <div
          style={{
            background: 'var(--soft)',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
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
                disabled={isProcessing}
              >
                ${val}
              </button>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                className={`preset-chip ${amount === remaining ? 'active' : ''}`}
                onClick={() => setAmount(remaining)}
                disabled={isProcessing}
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
                disabled={isProcessing}
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
              marginBottom: 16,
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Pool ownership share</span>
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

          {/* Error Message & Simulation Alternative */}
          {customError && (
            <div
              style={{
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#cf1322',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {customError}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSimulateFallback}
                style={{
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#cf1322',
                  fontSize: 11.5,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                Simulate Demo
              </button>
            </div>
          )}

          {/* Action Buttons */}
          {localSuccess || isContractSuccess ? (
            <div>
              <button
                type="button"
                className="bigfund-btn"
                style={{ background: '#58c939', color: '#fff' }}
                disabled
              >
                <CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Contribution Confirmed!
              </button>
              {hash && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <a
                    href={`${explorerBase}/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 11.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>View on Explorer ({hash.slice(0, 8)}...{hash.slice(-6)})</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <button
              type="submit"
              className="bigfund-btn"
              disabled={isProcessing || remaining <= 0}
            >
              {isContractPending ? (
                <>
                  <Loader2 size={16} className="spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Confirm in Wallet...
                </>
              ) : isConfirming ? (
                <>
                  <Loader2 size={16} className="spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Confirming onchain...
                </>
              ) : localSubmitting ? (
                'Processing...'
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
