'use client';

import React, { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { X, ShieldCheck, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { useMarket } from '@/context/MarketContext';
import { PhantomIcon, MetaMaskIcon, RabbyIcon, InjectedIcon } from './WalletIcons';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletItem {
  name: string;
  id: string;
  desc: string;
  isInstalled: boolean;
  downloadUrl: string;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect, isPending } = useConnect();
  const { connectDemoWallet } = useMarket();
  const [wallets, setWallets] = useState<WalletItem[]>([
    {
      name: 'Phantom',
      id: 'phantom',
      desc: 'Phantom multi-chain wallet (EVM & Solana)',
      isInstalled: false,
      downloadUrl: 'https://phantom.app/',
    },
    {
      name: 'MetaMask',
      id: 'metaMask',
      desc: 'The popular self-custody EVM wallet',
      isInstalled: false,
      downloadUrl: 'https://metamask.io/download/',
    },
    {
      name: 'Rabby Wallet',
      id: 'rabby',
      desc: 'The game-changing Web3 wallet for DeFi',
      isInstalled: false,
      downloadUrl: 'https://rabby.io/',
    },
    {
      name: 'Injected / Browser Wallet',
      id: 'injected',
      desc: 'Default injected extension (Brave, Coinbase, etc.)',
      isInstalled: false,
      downloadUrl: '',
    },
  ]);

  // Check extensions on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      phantom?: { ethereum?: { request: (args: unknown) => Promise<unknown> } };
      ethereum?: { isPhantom?: boolean; isMetaMask?: boolean; isRabby?: boolean; request?: (args: unknown) => Promise<unknown> };
    };

    setWallets((prev) =>
      prev.map((w) => {
        let installed = false;
        if (w.id === 'phantom') {
          installed = !!(win.phantom?.ethereum || win.ethereum?.isPhantom);
        } else if (w.id === 'metaMask') {
          installed = !!win.ethereum?.isMetaMask;
        } else if (w.id === 'rabby') {
          installed = !!win.ethereum?.isRabby;
        } else if (w.id === 'injected') {
          installed = !!win.ethereum;
        }
        return { ...w, isInstalled: installed };
      })
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (walletId: string, downloadUrl: string, isInstalled: boolean) => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      phantom?: { ethereum?: { request: (args: { method: string }) => Promise<string[]> } };
      ethereum?: { isPhantom?: boolean; isMetaMask?: boolean; isRabby?: boolean; request?: (args: { method: string }) => Promise<string[]> };
    };

    if (!isInstalled && downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }

    try {
      if (walletId === 'phantom' && win.phantom?.ethereum) {
        await win.phantom.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (win.ethereum?.request) {
        await win.ethereum.request({ method: 'eth_requestAccounts' });
      }

      const connector = connectors.find((c) => c.id === 'injected') || connectors[0];
      if (connector) {
        connect(
          { connector },
          {
            onSuccess: () => onClose(),
            onError: (err) => console.warn('Connect error:', err.message),
          }
        );
      }
      onClose();
    } catch (err: unknown) {
      console.warn('User rejected or wallet error:', err);
    }
  };

  const handleUseDemo = () => {
    connectDemoWallet();
    onClose();
  };

  const renderWalletIcon = (id: string) => {
    switch (id) {
      case 'phantom':
        return <PhantomIcon size={34} />;
      case 'metaMask':
        return <MetaMaskIcon size={34} />;
      case 'rabby':
        return <RabbyIcon size={34} />;
      default:
        return <InjectedIcon size={34} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <button type="button" className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="eyebrow" style={{ fontSize: 9.5 }}>
          Web3 Authentication · Robinhood Chain
        </div>
        <h3 className="serif-heading" style={{ fontSize: 26, margin: '4px 0 16px' }}>
          Connect a Wallet
        </h3>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          Connect your wallet to deploy capital into live token pools, track repayments, or request launch funding.
        </p>

        {/* Wallet Options */}
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => handleConnect(w.id, w.downloadUrl, w.isInstalled)}
              disabled={isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ink)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {renderWalletIcon(w.id)}
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                    {w.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {w.desc}
                  </div>
                </div>
              </div>

              {w.isInstalled ? (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 750,
                    background: 'var(--green-bg)',
                    color: 'var(--green-accent)',
                    padding: '3px 8px',
                    borderRadius: 999,
                  }}
                >
                  Detected
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                  <span>Install</span>
                  <ExternalLink size={12} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Demo Fast-Track fallback */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--soft)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 750, color: 'var(--ink)' }}>
              Quick Testnet Mode
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>
              Simulate with pre-loaded 4.85 ETH testnet wallet
            </div>
          </div>
          <button
            type="button"
            className="btn dark"
            style={{ padding: '6px 12px', fontSize: 11 }}
            onClick={handleUseDemo}
          >
            <Sparkles size={12} />
            <span>Use Test Wallet</span>
          </button>
        </div>

        <div className="risk-note" style={{ textAlign: 'center', marginTop: 14 }}>
          <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          By connecting, you agree to Robinhood Chain Testnet (ID 46630) terms.
        </div>
      </div>
    </div>
  );
};
