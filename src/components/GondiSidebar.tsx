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
  Activity as ActivityIcon,
  ExternalLink,
} from 'lucide-react';

export const GondiSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    external?: boolean;
  }

  const NAV_ITEMS: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Launch Pools', href: '/pools', icon: Layers },
    { label: 'Lender Portfolio', href: '/portfolio', icon: Briefcase },
    { label: 'Artists & Creators', href: '/creator', icon: Sparkles },
    { label: 'Live Activity', href: '/activity', icon: ActivityIcon },
    { label: 'Pons V2 Trade', href: '/trade', icon: ArrowLeftRight },
    { label: 'Mechanism & Docs', href: '/mechanism', icon: HelpCircle },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        width: isExpanded ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
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
            padding: '0 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#1d201a',
              color: 'var(--lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 900,
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(167, 255, 99, 0.2)',
            }}
          >
            ✦
          </div>
          {isExpanded && (
            <span
              style={{
                fontSize: 15,
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
                    color: '#8d8f87',
                    fontSize: 13,
                    fontWeight: 700,
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#8d8f87';
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
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isActive ? '#ffffff' : '#8d8f87',
                  fontSize: 13,
                  fontWeight: 750,
                  transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#8d8f87';
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
              background: '#58c939',
              boxShadow: '0 0 8px #58c939',
              flexShrink: 0,
            }}
          />
          {isExpanded && (
            <span style={{ fontSize: 11, color: '#8d8f87', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Robinhood 46630
            </span>
          )}
        </div>

        {isExpanded && (
          <div style={{ display: 'flex', gap: 12, paddingTop: 6, color: '#8d8f87' }}>
            <a
              href="https://github.com/wealthy-org/market"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11, fontWeight: 700 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8d8f87')}
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
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8d8f87')}
            >
              Explorer
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};
