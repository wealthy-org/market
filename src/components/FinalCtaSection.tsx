'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="final-section">
      <div className="wrap">
        <div className="eyebrow">Working title only · Pons V2</div>
        <h2 className="serif-heading">Fund the launch before the pool fills.</h2>
        <p>
          One standardized campaign. Small pooled contributions.
          Repayment directly from future Pons creator fee cash flow.
        </p>
        <Link href="#market" className="btn dark" style={{ padding: '12px 24px', fontSize: 14 }}>
          <span>Explore live requests</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};
