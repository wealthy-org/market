'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const MechanismSection: React.FC = () => {
  return (
    <section className="section" id="mechanism">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">02 / Mechanism</div>
          <div>
            <h2 className="serif-heading">Capital today. Fees tomorrow.</h2>
            <p className="section-copy">
              Funding is tied to one launch expense, while future creator fees are routed through
              a FinanceSplitter until lenders reach the agreed repayment cap. Once completed,
              fee rights automatically return to the creator.
            </p>
          </div>
        </div>

        <div className="cards-grid">
          {/* Card 1: For Creators */}
          <article className="card-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">For creators</div>
              <Zap size={16} color="var(--ink)" />
            </div>

            <h3 className="serif-heading">Turn traction into budget.</h3>
            <p>
              Once a token shows early activity, open a standardized request and exchange a temporary
              share of future creator fees for launch capital on Robinhood Chain.
            </p>

            <div className="flow-container">
              <div className="flowline">
                <div className="node">Live Pons token</div>
                <ArrowRight size={14} />
                <div className="node">Funding request</div>
              </div>
              <div className="flowline">
                <div className="node">Pool fills 100%</div>
                <ArrowRight size={14} />
                <div className="node">Campaign paid upfront</div>
              </div>
            </div>
          </article>

          {/* Card 2: For Lenders */}
          <article className="card-item dark">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow" style={{ color: '#aeb0a8' }}>
                For lenders
              </div>
              <ShieldCheck size={16} color="var(--lime)" />
            </div>

            <h3 className="serif-heading">Own a slice of the fee stream.</h3>
            <p>
              Enter with a small allocation (starting at $10), receive pro-rata repayment from
              onchain creator fees, then recycle recovered capital into the next launch.
            </p>

            <div className="flow-container">
              <div className="flowline">
                <div className="node">Fund pool</div>
                <ArrowRight size={14} color="#aeb0a8" />
                <div className="node">Creator fees routed</div>
              </div>
              <div className="flowline">
                <div className="node">Repayment cap reached</div>
                <ArrowRight size={14} color="#aeb0a8" />
                <div className="node">Fund again</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
