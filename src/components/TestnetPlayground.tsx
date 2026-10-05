'use client';

import React, { useState } from 'react';
import { useMarket } from '@/context/MarketContext';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw, 
  Coins, 
  CheckCircle, 
  ShieldAlert, 
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';

export const TestnetPlayground: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedDeal,
    simulateFeeInflow,
    simulatePoolFill,
    simulateExpireAndRefund,
    resetAllDemoState
  } = useMarket();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  // DEMO only: hide on Robinhood mainnet (4663) unless ?debug=1.
  // Keeps prod clean like Gondi; playground is a Phase-5 testnet aid (brief #37).
  const showDebug =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  if (chainId === 4663 && !showDebug) return null;

  return (
    <aside
      aria-label="Testnet Developer Tools (demo, no real ETH moves)"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 60,
        fontFamily: 'var(--sans, system-ui, sans-serif)',
      }}
    >
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--ink, #11120f)',
            color: '#a7ff63',
            border: '1px solid rgba(167,255,99,0.3)',
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 12.5,
            fontWeight: 750,
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,0,0,0.28)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#a7ff63',
            boxShadow: '0 0 10px #a7ff63',
          }} />
          <span>Testnet Tools · DEMO</span>
          <ChevronUp size={14} />
        </button>
      )}

      {/* Expanded Devtools Drawer */}
      {isOpen && (
        <div
          style={{
            width: 340,
            background: '#ffffff',
            border: '1px solid var(--line, #e2ded5)',
            borderRadius: 20,
            boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              background: 'var(--ink, #11120f)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="#a7ff63" />
              <div>
                <b style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>Testnet Playground · DEMO</b>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                  Local simulation — no real ETH moves. Onchain actions live in Fund / Claim buttons.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 0,
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <div style={{ padding: '16px 18px', display: 'grid', gap: 14 }}>
            {/* Active Token Context */}
            <div
              style={{
                background: 'var(--soft, #f7f6f1)',
                padding: '10px 12px',
                borderRadius: 12,
                fontSize: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ color: 'var(--muted, #6f6e69)', fontSize: 10.5 }}>ACTIVE TARGET</span>
                <b style={{ display: 'block', fontSize: 13 }}>{selectedDeal.token.symbol} Pool</b>
              </div>
              <span className={`pill ${selectedDeal.status === 'HOT' ? 'hot' : ''}`} style={{ fontSize: 10.5 }}>
                {selectedDeal.status}
              </span>
            </div>

            {/* Quick Simulation Actions */}
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted, #6f6e69)', marginBottom: 8, letterSpacing: '0.06em' }}>
                SIMULATE (LOCAL) — PONS FEE ROUTING
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => simulateFeeInflow(selectedDeal.id, 25)}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--line, #e2ded5)',
                    background: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft, #f7f6f1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <Coins size={13} style={{ marginBottom: 4, color: 'var(--green-accent)' }} />
                  <div>Simulate +$25 (local)</div>
                  <small style={{ color: 'var(--muted)', fontSize: 10 }}>70% to lenders</small>
                </button>

                <button
                  type="button"
                  onClick={() => simulateFeeInflow(selectedDeal.id, 100)}
                  style={{
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--line, #e2ded5)',
                    background: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft, #f7f6f1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <Flame size={13} style={{ marginBottom: 4, color: '#ff6b4a' }} />
                  <div>Simulate +$100 (local)</div>
                  <small style={{ color: 'var(--muted)', fontSize: 10 }}>Big trading volume</small>
                </button>
              </div>

              <button
                type="button"
                onClick={() => simulateFeeInflow(selectedDeal.id, 380)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--line, #e2ded5)',
                  background: 'var(--green-bg, #edf7e9)',
                  color: 'var(--green-accent, #3d7d28)',
                  fontSize: 11.5,
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle size={13} />
                <span>Simulate 1.20× cap (local)</span>
              </button>
            </div>

            {/* Pool Lifecycle Actions */}
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted, #6f6e69)', marginBottom: 8, letterSpacing: '0.06em' }}>
                SIMULATE (LOCAL) — POOL LIFECYCLE
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => simulatePoolFill(selectedDeal.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--line, #e2ded5)',
                    background: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Simulate fill 100% (local)
                </button>

                <button
                  type="button"
                  onClick={() => simulateExpireAndRefund(selectedDeal.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--line, #e2ded5)',
                    background: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Simulate expire (local)
                </button>
              </div>
            </div>

            {/* Contract Info & Reset */}
            <div style={{ borderTop: '1px solid var(--line-soft, #ece7de)', paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href="https://robinhoodchain.blockscout.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 11,
                    color: 'var(--muted, #6f6e69)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>Blockscout</span>
                  <ExternalLink size={10} />
                </a>

                <button
                  type="button"
                  onClick={resetAllDemoState}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'var(--muted, #6f6e69)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RefreshCw size={10} />
                  <span>Reset Testnet State</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
