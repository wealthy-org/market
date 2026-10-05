'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const MechanismSection: React.FC = () => {
  return (
    <section style={{ marginBottom: 48 }} id="mechanism">
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          02 / Mechanism
        </div>
        <h2 className="serif-heading" style={{ fontSize: 28, color: 'var(--ink)' }}>
          Capital today. Fees tomorrow.
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4, maxWidth: 640 }}>
          Funding is tied to one launch expense, while future creator fees are routed through a splitter until lenders reach the agreed repayment cap.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {/* Card 1: For Creators (Light Paper Card) */}
        <article
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            boxShadow: '0 10px 30px rgba(20, 20, 15, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="eyebrow">For creators</span>
            <Zap size={16} color="var(--ink)" />
          </div>

          <h3 className="serif-heading" style={{ fontSize: 26, color: 'var(--ink)', margin: '6px 0 10px' }}>
            Turn traction into budget.
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
            Once a token shows early activity, open a standardized request and exchange a temporary share of future creator fees for launch capital.
          </p>

          <div
            style={{
              marginTop: 'auto',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                Live Pons token
              </div>
              <ArrowRight size={14} color="var(--muted)" />
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                Funding request
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--ink)',
                }}
              >
                Pool fills
              </div>
              <ArrowRight size={14} color="var(--muted)" />
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--emerald)',
                }}
              >
                Campaign paid
              </div>
            </div>
          </div>
        </article>

        {/* Card 2: For Lenders (Dark Ink Card matching prototype .card.dark) */}
        <article
          style={{
            background: 'var(--ink)',
            color: '#ffffff',
            border: '1px solid var(--ink)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            boxShadow: '0 14px 40px rgba(17, 18, 15, 0.16)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="eyebrow" style={{ color: '#aeb0a8' }}>
              For lenders
            </span>
            <ShieldCheck size={16} color="var(--lime)" />
          </div>

          <h3 className="serif-heading" style={{ fontSize: 26, color: '#ffffff', margin: '6px 0 10px' }}>
            Own a slice of the fee stream.
          </h3>
          <p style={{ fontSize: 13.5, color: '#bec0b9', lineHeight: 1.6, marginBottom: 24 }}>
            Enter with a small allocation, receive pro-rata repayment from creator fees, then recycle capital into the next launch.
          </p>

          <div
            style={{
              marginTop: 'auto',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #3c3e38',
                  background: '#20221e',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Fund pool
              </div>
              <ArrowRight size={14} color="#aeb0a8" />
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #3c3e38',
                  background: '#20221e',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Creator fees
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #3c3e38',
                  background: '#20221e',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                1.20x Repayment
              </div>
              <ArrowRight size={14} color="#aeb0a8" />
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--lime)',
                  background: '#20221e',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--lime)',
                }}
              >
                Fund again
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
