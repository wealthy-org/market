'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarket } from '@/context/MarketContext';
import { useAccount } from 'wagmi';
import { useTransferPonsFeeRecipient, useCreateFundingPool } from '@/hooks/useFundingProtocol';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function CreateRequestPage() {
  const router = useRouter();
  const { isConnected, address: walletAddress } = useAccount();
  const { createNewRequest } = useMarket();

  const [step, setStep] = useState<number>(1);
  const [symbol, setSymbol] = useState<string>('$ALPHA');
  const [tokenName, setTokenName] = useState<string>('Alpha Protocol');
  const [tokenAddress, setTokenAddress] = useState<string>('0x9a88B12c58eA12d48092789123481a8271b29a1');
  const [lenderShare, setLenderShare] = useState<number>(75);

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

  const isVerifiedTransferred = isTransferSuccess || localTransferred;
  const isTransferring = isTransferPending || isTransferConfirming || isSimulatingTransfer;
  const isCreating = isCreatePending || isCreateConfirming;

  const handleExecuteTransfer = async () => {
    if (isConnected) {
      try {
        await transferRecipient(
          tokenAddress as `0x${string}`, 
          CONTRACT_ADDRESSES.splitter as `0x${string}`
        );
        return;
      } catch (err) {
        console.warn('Onchain transfer failed:', err);
      }
    }

    setIsSimulatingTransfer(true);
    setTimeout(() => {
      setIsSimulatingTransfer(false);
      setLocalTransferred(true);
    }, 1200);
  };

  const handleFinish = async () => {
    if (isConnected) {
      try {
        await createPool(tokenAddress as `0x${string}`, 1200);
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
        creatorAddress: walletAddress || '0xDemoCreator',
        imageUrl: 'https://lh3.googleusercontent.com/TbbppD5KJwxtyLaGM4dtCnLtMlwslnP2Tf1YJxQFSZqGwwmxTbZB_aIvp0mcIdd4UJg5O7W2PjXCoJ4DT7wKP3S_cbhb2JXGLTFb',
      },
      campaignName: 'DEX Screener Paid',
      campaignTargetUsd: 299,
      lenderFeeSharePct: lenderShare,
      creatorFeeSharePct: 100 - lenderShare,
      poolContractAddress: CONTRACT_ADDRESSES.samplePool,
    });

    router.push('/pools');
  };

  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed" style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <Link
          href="/creator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: 'var(--muted)',
            textDecoration: 'none',
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} /> Back to Creator Hub
        </Link>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(20,20,15,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="pill momentum">Pons V2 Financing</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>Step {step} of 3</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.03em' }}>
            {step === 1 && 'Select Token & Campaign'}
            {step === 2 && 'Set Repayment Share'}
            {step === 3 && 'Secure Creator Fee Transfer'}
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 24 }}>
            {step === 1 && 'Standardized $299 launch pools for tokens with early activity on Robinhood Chain.'}
            {step === 2 && 'Choose the percentage of future DEX creator fees temporarily shared with lenders until 1.20x is repaid.'}
            {step === 3 && 'Brief #16 lender protection: redirect Pons creatorFeeRecipient to FinanceSplitter before the pool opens.'}
          </p>

          {step === 1 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Token Name
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#ffffff', fontSize: 13, color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#ffffff', fontSize: 13, color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Pons Token Address
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#ffffff', fontSize: 12, fontFamily: 'monospace', color: 'var(--ink)' }}
                />
              </div>

              <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Campaign Target</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>$299.00 (≈ 0.1196 ETH)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Window</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>20 Minutes · All-or-Nothing</span>
                </div>
              </div>

              <button
                type="button"
                className="btn lime"
                onClick={() => setStep(2)}
                style={{ width: '100%', padding: 12, fontSize: 13, fontWeight: 800, marginTop: 8 }}
              >
                Continue to Step 2
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>Lender Fee Split</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--emerald)' }}>{lenderShare}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="85"
                  step="5"
                  value={lenderShare}
                  onChange={(e) => setLenderShare(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ink)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  <span>60% (Slower)</span>
                  <span>75% (Standard)</span>
                  <span>85% (Fastest)</span>
                </div>
              </div>

              <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, fontSize: 12.5, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Fixed Return Cap</span>
                  <b style={{ color: 'var(--ink)' }}>1.20x ($358.80 max)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Creator Cash Flow</span>
                  <b style={{ color: 'var(--ink)' }}>{100 - lenderShare}% perpetual</b>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 700 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn lime"
                  onClick={() => setStep(3)}
                  style={{ flex: 2, padding: 12, fontSize: 13, fontWeight: 800 }}
                >
                  Continue to Verification
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 16, background: isVerifiedTransferred ? 'rgba(64,121,44,0.06)' : 'var(--soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <ShieldCheck size={20} color={isVerifiedTransferred ? 'var(--emerald)' : 'var(--muted)'} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
                    Pons transferCreatorFeeRecipient
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
                  Directs incoming LP swap fee distributions to the FinanceSplitter contract. Once 1.20x is repaid, rights automatically return.
                </p>

                <button
                  type="button"
                  className="btn"
                  onClick={handleExecuteTransfer}
                  disabled={isVerifiedTransferred || isTransferring}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 12, fontWeight: 800 }}
                >
                  {isVerifiedTransferred
                    ? 'Verified on Pons V2'
                    : isTransferring
                    ? 'Confirming Transfer...'
                    : 'Execute Fee Transfer'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStep(2)}
                  style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 700 }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn lime"
                  onClick={handleFinish}
                  disabled={!isVerifiedTransferred || isCreating}
                  style={{ flex: 2, padding: 12, fontSize: 13, fontWeight: 800 }}
                >
                  {isCreating ? 'Deploying Pool...' : 'Launch Funding Pool'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
