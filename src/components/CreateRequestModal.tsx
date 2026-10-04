'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { X, Check, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const CreateRequestModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createNewRequest, walletAddress } = useMarket();

  const [step, setStep] = useState<number>(1);
  const [symbol, setSymbol] = useState<string>('$ALPHA');
  const [tokenName, setTokenName] = useState<string>('Alpha Protocol');
  const [tokenAddress, setTokenAddress] = useState<string>('0x9a88B12c58eA12d48092');
  const [lenderShare, setLenderShare] = useState<number>(70);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isRecipientTransferred, setIsRecipientTransferred] = useState<boolean>(false);

  if (!isCreateModalOpen) return null;

  const handleSimulateTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setIsRecipientTransferred(true);
    }, 1200);
  };

  const handleFinish = () => {
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
    });
    setStep(1);
    setIsRecipientTransferred(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button
          type="button"
          className="modal-close"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <X size={18} />
        </button>

        <div className="eyebrow" style={{ fontSize: 9.5 }}>
          Creator Onboarding · Step {step} of 3
        </div>
        <h3 className="serif-heading" style={{ fontSize: 26, margin: '4px 0 18px' }}>
          Create Launch Funding Request
        </h3>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: s <= step ? 'var(--ink)' : 'var(--line-soft)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 18 }}>
              Select an already-live Pons token that has generated early trading activity.
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
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    background: '#fff',
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
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    background: '#fff',
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
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    background: '#fff',
                    fontFamily: 'monospace',
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
                background: '#f8f7f2',
                borderRadius: 16,
                border: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', marginBottom: 8 }}>
                PONS V2 ELIGIBILITY AUDIT
              </div>
              <div style={{ display: 'grid', gap: 6, fontSize: 12.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Token age &gt;= 15m (Detected: 24m)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Unique traders &gt;= 20 (Detected: 42 traders)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Creator fees generated &gt;= $15 (Detected: $38.20)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#3d7d28" />
                  <span>Creator fee recipient transferable</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn dark"
              style={{ width: '100%', marginTop: 24, padding: 13, borderRadius: 12 }}
              onClick={() => setStep(2)}
            >
              <span>Continue to Campaign Terms</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 18 }}>
              Standardized V1 launch campaign and repayment terms.
            </p>

            <div
              style={{
                border: '2px solid var(--ink)',
                borderRadius: 16,
                padding: 18,
                background: '#fff',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 16 }}>DEX Screener Paid Info</b>
                <span className="pill">Standard V1</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
                Enhanced Token Info, banner, social verification, and trending qualification.
              </div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800 }}>
                Target Cost: $299 in ETH
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span>Lender Fee Share</span>
                <span style={{ color: 'var(--green-accent)' }}>{lenderShare}% to lenders / {100 - lenderShare}% you keep</span>
              </div>
              <input
                type="range"
                min="60"
                max="85"
                step="5"
                value={lenderShare}
                onChange={(e) => setLenderShare(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ink)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                <span>60% (Slower fill)</span>
                <span>70% (Recommended)</span>
                <span>85% (Fastest fill)</span>
              </div>
            </div>

            <div
              style={{
                background: 'var(--soft)',
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 12.5,
                display: 'grid',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Repayment Cap</span>
                <b>1.20× ($358.80 max)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Estimated payback</span>
                <b>~8.5 hours</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, padding: 13, borderRadius: 12 }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn dark"
                style={{ flex: 2, padding: 13, borderRadius: 12 }}
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
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 18 }}>
              To activate the pool, temporarily transfer your Pons token&apos;s{' '}
              <code>creatorFeeRecipient</code> to the designated <b>FinanceSplitter</b> contract.
            </p>

            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: 16,
                background: '#fff',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>
                PONS V2 CALL
              </div>
              <code style={{ fontSize: 12, display: 'block', background: 'var(--soft)', padding: 10, borderRadius: 8 }}>
                transferCreatorFeeRecipient({tokenAddress.slice(0, 10)}..., FinanceSplitter)
              </code>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
                <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: '#3d7d28' }} />
                Guaranteed by protocol smart contract: fee recipient will automatically be
                transferred back to your wallet once 1.20× cap is repaid.
              </p>
            </div>

            {isRecipientTransferred ? (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--green-bg)',
                  border: '1px solid #cbe9be',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--green-accent)',
                  fontWeight: 750,
                  fontSize: 13.5,
                  marginBottom: 20,
                }}
              >
                <Check size={18} />
                <span>Recipient successfully transferred to FinanceSplitter!</span>
              </div>
            ) : (
              <button
                type="button"
                className="btn dark"
                style={{ width: '100%', padding: 13, borderRadius: 12, marginBottom: 20 }}
                onClick={handleSimulateTransfer}
                disabled={isTransferring}
              >
                {isTransferring ? 'Broadcasting to Robinhood Chain...' : 'Transfer Recipient to FinanceSplitter'}
              </button>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, padding: 13, borderRadius: 12 }}
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn lime"
                style={{ flex: 2, padding: 13, borderRadius: 12 }}
                disabled={!isRecipientTransferred}
                onClick={handleFinish}
              >
                <Sparkles size={16} />
                <span>Open Launch Pool</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
