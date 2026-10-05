'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMarket } from '@/context/MarketContext';
import { Search, ChevronDown, Copy, Check, LogOut, Briefcase, ExternalLink, PlusCircle } from 'lucide-react';

export const GondiHeader: React.FC = () => {
  const {
    isWalletConnected,
    walletAddress,
    ethBalance,
    openWalletModal,
    disconnectWallet,
    setIsCreateModalOpen,
    deals,
    setSelectedDealId,
  } = useMarket();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Filter deals based on search
  const filteredDeals = searchQuery.trim()
    ? deals.filter((d) => 
        d.token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.token.creatorAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left: Mobile Star Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span
            style={{
              color: 'var(--lime)',
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            ✦
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            PONS
          </span>
        </Link>
      </div>

      {/* Center: Gondi Signature Search Bar */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '0 20px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-input)',
            border: `1px solid ${isSearchFocused ? 'var(--line-strong)' : 'var(--line)'}`,
            borderRadius: 'var(--radius-full)',
            padding: '7px 16px',
            transition: 'border-color 0.15s ease',
          }}
        >
          <Search size={15} style={{ color: 'var(--muted)', marginRight: 10, flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search collections, artists, users or items"
            style={{
              background: 'transparent',
              border: 0,
              outline: 'none',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              width: '100%',
            }}
          />
          <span
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--line)',
              borderRadius: 4,
              color: 'var(--muted)',
              fontSize: 11,
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.4,
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            /
          </span>
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && filteredDeals.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#15181c',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          >
            <div style={{ padding: '6px 14px', fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.05em' }}>
              MATCHING LAUNCH POOLS
            </div>
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => {
                  setSelectedDealId(deal.id);
                  setSearchQuery('');
                  const el = document.getElementById('deal-detail');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: '#1e242a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                      color: 'var(--lime)',
                    }}
                  >
                    {deal.token.symbol.replace('$', '').slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 750, color: '#fff' }}>{deal.token.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {deal.token.symbol} · by {deal.token.creatorAddress}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--emerald)' }}>
                    {((deal.fundedUsd / deal.campaignTargetUsd) * 100).toFixed(0)}% Funded
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>Cap: {deal.repayCapMultiplier}x</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Network, Create Pool, Connect Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Robinhood Chain Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-full)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ink-secondary)',
          }}
          title="Robinhood Chain Testnet (ID 46630)"
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700 }}>Robinhood 46630</span>
        </div>

        {/* Create Request / For Creators Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-elevated)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            borderRadius: 'var(--radius-full)',
            padding: '7px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-strong)';
            e.currentTarget.style.background = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line)';
            e.currentTarget.style.background = 'var(--surface-elevated)';
          }}
        >
          <PlusCircle size={14} style={{ color: 'var(--lime)' }} />
          <span>Launch Pool</span>
        </button>

        {/* Gondi Connect Wallet Pill */}
        {isWalletConnected ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--surface-card)',
                border: '1px solid var(--line-strong)',
                color: 'var(--ink)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 750,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-card)')}
            >
              <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>{ethBalance.toFixed(2)} ETH</span>
              <span style={{ color: 'var(--muted)' }}>•</span>
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <ChevronDown size={13} style={{ color: 'var(--muted)' }} />
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 260,
                  background: '#15181c',
                  border: '1px solid var(--line-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
                  zIndex: 100,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                      color: copied ? 'var(--emerald)' : 'var(--muted)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--surface-input)',
                    padding: '8px 10px',
                    borderRadius: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 12,
                  }}
                >
                  {walletAddress}
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'grid', gap: 4 }}>
                  <Link
                    href="/portfolio"
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink-secondary)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Briefcase size={14} />
                    <span>My Lender Portfolio</span>
                  </Link>

                  <a
                    href={`https://robinhoodchain.blockscout.com/address/${walletAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--ink-secondary)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ExternalLink size={14} />
                    <span>View on Explorer</span>
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
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--coral)',
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn primary"
            onClick={openWalletModal}
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Connect wallet
          </button>
        )}
      </div>
    </header>
  );
};
