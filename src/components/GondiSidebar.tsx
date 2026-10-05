'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Layers, 
  Briefcase, 
  Sparkles, 
  ArrowLeftRight, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Disc as DiscordIcon
} from 'lucide-react';

export const GondiSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Launch Pools', href: '/#market', icon: Layers },
    { label: 'Lender Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Artists & Creators', href: '/creator', icon: Sparkles },
    { label: 'Pons V2 Trade', href: 'https://robinhoodchain.blockscout.com', icon: ArrowLeftRight, external: true },
    { label: 'Mechanism & Docs', href: '/#mechanism', icon: HelpCircle },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        width: isExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)',
        background: isExpanded ? 'var(--bg-sidebar)' : '#101315',
        borderRight: '1px solid var(--line)',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        flexShrink: 0,
        overflowX: 'hidden',
      }}
    >
      {/* Top Logo */}
      <div>
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid var(--line)',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#163321',
              color: 'var(--lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          {isExpanded && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              PONS MARKET
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 10px', display: 'grid', gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 14px',
                    borderRadius: 10,
                    color: 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 700,
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isExpanded ? 'var(--bg-sidebar-hover)' : 'var(--surface-hover)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--muted)';
                  }}
                >
                  <Icon size={19} style={{ flexShrink: 0 }} />
                  {isExpanded && <span>{item.label}</span>}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: isActive ? (isExpanded ? 'var(--bg-sidebar-hover)' : 'var(--surface-elevated)') : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--muted)',
                  fontSize: 13,
                  fontWeight: 750,
                  transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive && !isExpanded ? 'inset 2px 0 0 var(--emerald)' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isExpanded ? 'var(--bg-sidebar-hover)' : 'var(--surface-hover)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--muted)';
                  }
                }}
              >
                <Icon size={19} style={{ flexShrink: 0, color: isActive ? 'var(--lime)' : 'inherit' }} />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Links */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              flexShrink: 0,
            }}
          />
          {isExpanded && (
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Robinhood 46630
            </span>
          )}
        </div>

        {isExpanded && (
          <div style={{ display: 'flex', gap: 12, paddingTop: 6, color: 'var(--muted)' }}>
            <a
              href="https://github.com/wealthy-org/market"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, fontWeight: 700 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, fontWeight: 700 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              Explorer
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
