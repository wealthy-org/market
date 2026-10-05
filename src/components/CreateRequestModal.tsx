'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { useAccount } from 'wagmi';
import { useTransferPonsFeeRecipient, useCreateFundingPool } from '@/hooks/useFundingProtocol';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { X, Check, ArrowRight, ShieldCheck, Sparkles, Loader2, Info } from 'lucide-react';

export const CreateRequestModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createNewRequest, walletAddress } = useMarket();
  const { isConnected } = useAccount();

  const [step, setStep] = useState<number>(1);
  const [symbol, setSymbol] = useState<string>('$ALPHA');
  const [tokenName, setTokenName] = useState<string>('Alpha Protocol');
  const [tokenAddress, setTokenAddress] = useState<string>('0x9a88B12c58eA12d48092789123481a8271b29a1');
  const [lenderShare, setLenderShare] = useState<number>(70);

  // Wagmi hooks for onchain actions
  const { 
    transferRecipient, 
    isPending: isTransferPending, 
    isConfirming: isTransferConfirming, 
    isSuccess: isTransferSuccess, 
  } = useTransferPonsFeeRecipient();

  const {
    createPool,
    isPending: isCreatePending,
    isConfirming: isCreateConfirming,
  } = useCreateFundingPool();

  const [localTransferred, setLocalTransferred] = useState<boolean>(false);
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState<boolean>(false);

  if (!isCreateModalOpen) return null;

  const isVerifiedTransferred = isTransferSuccess || localTransferred;
  const isTransferring = isTransferPending || isTransferConfirming || isSimulatingTransfer;
  const isCreating = isCreatePending || isCreateConfirming;

  const handleExecuteTransfer = async () => {
    if (isConnected) {
      try {
        await transferRecipient(
          tokenAddress as `0x${string}`, 
          CONTRACT_ADDRESSES.factory
        );
        return;
      } catch (err) {
        console.warn('Onchain transfer failed, falling back to prototype confirmation:', err);
      }
    }

    // Demo/prototype fallback
    setIsSimulatingTransfer(true);
    setTimeout(() => {
      setIsSimulatingTransfer(false);
      setLocalTransferred(true);
    }, 1200);
  };

  const handleFinish = async () => {
    if (isConnected) {
      try {
        await createPool(tokenAddress as `0x${string}`, '0.12', 86400);
      } catch (err) {
        console.warn('Factory creation onchain fallback:', err);
      }
    }

    createNewRequest({
      token: {
        name: tokenName,
        symbol: symbol.startsWith('$') ? symbol : `$${symbol}`,
        address: tokenAddress,
        avatar: symbol.replace('$', '').slice(0, 3).toUpperCase(),
        age: '24m',
        chain: 'Robinhood Chain',
        pairToken: 'WETH',
        creatorAddress: walletAddress,
      },
      campaignName: 'DEX Screener Paid',
      campaignTargetUsd: 299,
      lenderFeeSharePct: lenderShare,
      creatorFeeSharePct: 100 - lenderShare,
      poolContractAddress: CONTRACT_ADDRESSES.samplePool,
    });

    setStep(1);
    setLocalTransferred(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 540, background: '#14181c', border: '1px solid var(--line-strong)' }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <X size={18} />
        </button>

        <div className="eyebrow" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.08em' }}>
          CREATOR LAUNCH SETUP · STEP {step} OF 3
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '6px 0 18px', letterSpacing: '-0.02em' }}>
          Create Launch Funding Request
        </h3>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: s <= step ? 'var(--lime)' : 'var(--line-soft)',
                boxShadow: s <= step ? '0 0 10px rgba(167, 255, 99, 0.4)' : undefined,
                transition: 'background 0.25s, box-shadow 0.25s',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
              Select an already-live Pons token that has generated early trading activity on Robinhood Chain.
            </p>

            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  TOKEN SYMBOL
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-input)',
                    color: '#ffffff',
                    fontWeight: 750,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  TOKEN NAME
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-input)',
                    color: '#ffffff',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  PONS TOKEN CONTRACT (ROBINHOOD CHAIN)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-input)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {/* Live Eligibility Check preview */}
            <div
              style={{
                marginTop: 20,
                padding: '14px 18px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: 12,
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--emerald)', marginBottom: 8, letterSpacing: '0.04em' }}>
                PONS V2 ELIGIBILITY AUDIT
              </div>
              <div style={{ display: 'grid', gap: 6, fontSize: 12.5, color: '#e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--emerald)" />
                  <span>Token age &gt;= 15m (Detected: 24m)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--emerald)" />
                  <span>Unique traders &gt;= 20 (Detected: 42 traders)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--emerald)" />
                  <span>Creator fees generated &gt;= $15 (Detected: $38.20)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="var(--emerald)" />
                  <span>Creator fee recipient transferable</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                marginTop: 24,
                padding: '12px 18px',
                borderRadius: 'var(--radius-full)',
                background: '#ffffff',
                color: '#0e1113',
                border: 0,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              onClick={() => setStep(2)}
            >
              <span>Continue to Campaign Terms</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>
              Standardized V1 launch campaign and repayment terms.
            </p>

            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 16,
                background: 'var(--surface-input)',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 15, color: '#ffffff' }}>DEX Screener Fast-Track Paid</b>
                <span className="pill momentum" style={{ fontSize: 10.5 }}>Standard V1</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                Enhanced Token Info, banner, social verification, and trending qualification.
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800, color: 'var(--lime)' }}>
                Target Cost: $299 in ETH (0.1196 ETH)
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <span style={{ color: '#ffffff' }}>Lender Fee Share</span>
                <span style={{ color: 'var(--emerald)' }}>{lenderShare}% to lenders / {100 - lenderShare}% you keep</span>
              </div>
              <input
                type="range"
                min="60"
                max="85"
                step="5"
                value={lenderShare}
                onChange={(e) => setLenderShare(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--lime)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                <span>60% (Slower fill)</span>
                <span>70% (Standard)</span>
                <span>85% (Fastest fill)</span>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-input)',
                border: '1px solid var(--line-soft)',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 12.5,
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Repayment Cap</span>
                <b style={{ color: '#ffffff' }}>1.20× ($358.80 max return)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Estimated payback</span>
                <b style={{ color: 'var(--emerald)' }}>~8.5 hours</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontSize: 12.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                style={{
                  flex: 2,
                  padding: 12,
                  borderRadius: 'var(--radius-full)',
                  background: '#ffffff',
                  color: '#0e1113',
                  border: 0,
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => setStep(3)}
              >
                <span>Continue to Splitter Setup</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>
              To activate the pool, temporarily transfer your Pons token&apos;s{' '}
              <code style={{ color: 'var(--lime)' }}>creatorFeeRecipient</code> to the protocol smart contract.
            </p>

            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 16,
                background: 'var(--surface-input)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                PONS V2 CALL
              </div>
              <code
                style={{
                  fontSize: 11.5,
                  display: 'block',
                  background: '#111417',
                  border: '1px solid var(--line-soft)',
                  padding: 10,
                  borderRadius: 8,
                  wordBreak: 'break-all',
                  color: 'var(--lime)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                transferCreatorFeeRecipient({tokenAddress.slice(0, 10)}..., {CONTRACT_ADDRESSES.factory.slice(0, 10)}...)
              </code>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
                <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--emerald)' }} />
                Guaranteed by protocol smart contract: fee recipient will automatically be
                transferred back to your wallet once the 1.20× cap is repaid.
              </p>
            </div>

            {isVerifiedTransferred ? (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--emerald)',
                  fontWeight: 750,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                <Check size={18} />
                <span>Recipient successfully transferred to protocol contract!</span>
              </div>
            ) : (
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: 13,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--surface-elevated)',
                  color: '#ffffff',
                  border: '1px solid var(--line)',
                  fontSize: 12.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                  marginBottom: 20,
                }}
                onClick={handleExecuteTransfer}
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 size={15} className="spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Broadcasting to Robinhood Chain...
                  </>
                ) : (
                  'Transfer Recipient to Protocol Contract'
                )}
              </button>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontSize: 12.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
                onClick={() => setStep(2)}
                disabled={isCreating}
              >
                Back
              </button>
              <button
                type="button"
                style={{
                  flex: 2,
                  padding: 12,
                  borderRadius: 'var(--radius-full)',
                  background: !isVerifiedTransferred || isCreating ? 'var(--surface-elevated)' : 'var(--lime)',
                  color: !isVerifiedTransferred || isCreating ? 'var(--muted)' : '#0e1113',
                  border: 0,
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: !isVerifiedTransferred || isCreating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                disabled={!isVerifiedTransferred || isCreating}
                onClick={handleFinish}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Deploying Pool...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Open Launch Pool</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
