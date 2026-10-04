'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { ChevronDown, ExternalLink, Briefcase, LogOut, Copy, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isWalletConnected,
    walletAddress,
    ethBalance,
    openWalletModal,
    disconnectWallet,
    setIsCreateModalOpen,
  } = useMarket();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav>
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="mark" aria-hidden="true" />
          <span>Launch Funding Market</span>
        </Link>

        <div className="nav-links">
          <Link href="/#market">Market</Link>
          <Link href="/#mechanism">Mechanism</Link>
          <Link href="/#deal">Deal view</Link>
          <Link href="/#activity">Activity</Link>
          <Link href="/portfolio">Portfolio</Link>
        </div>

        <div className="nav-actions">
          {/* Robinhood Chain Badge */}
          <div className="network-badge" title="Robinhood Chain Testnet (ID 46630)">
            <span className="network-dot" />
            <span>Robinhood 46630</span>
          </div>

          <button
            type="button"
            className="btn"
            style={{ padding: '8px 14px', fontSize: '12.5px' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            For creators
          </button>

          {isWalletConnected ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                className="btn dark wallet-pill"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{ethBalance.toFixed(2)} ETH</span>
                <span className="wallet-addr">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <ChevronDown size={12} style={{ opacity: 0.8 }} />
              </button>

              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 280,
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    borderRadius: 16,
                    padding: 14,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 800, letterSpacing: '0.08em' }}>
                      CONNECTED WALLET
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(walletAddress);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        border: 0,
                        background: 'transparent',
                        color: copied ? 'var(--green-accent)' : 'var(--muted)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                      }}
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: 'var(--ink)',
                      fontFamily: 'monospace',
                      background: 'var(--soft)',
                      padding: '8px 10px',
                      borderRadius: 10,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={walletAddress}
                  >
                    {walletAddress}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 10,
                      padding: '8px 12px',
                      background: 'var(--soft)',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: 'var(--muted)' }}>Balance</span>
                    <span>{ethBalance.toFixed(4)} ETH</span>
                  </div>

                  <div style={{ marginTop: 12, display: 'grid', gap: 4 }}>
                    <Link
                      href="/portfolio"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--ink)',
                        padding: '8px 10px',
                        borderRadius: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Briefcase size={14} />
                      <span>My Portfolio</span>
                    </Link>

                    <a
                      href="https://robinhoodchain.blockscout.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12.5,
                        color: 'var(--muted)',
                        padding: '8px 10px',
                        borderRadius: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>Blockscout Explorer</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        disconnectWallet();
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        border: 0,
                        background: 'transparent',
                        color: 'var(--red-accent)',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: 4,
                        borderTop: '1px solid var(--line-soft)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={13} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn dark"
              style={{ padding: '8px 16px', fontSize: '12.5px' }}
              onClick={openWalletModal}
            >
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
