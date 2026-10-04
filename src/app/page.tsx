'use client';

import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { MarketSection } from '@/components/MarketSection';
import { MechanismSection } from '@/components/MechanismSection';
import { DealViewSection } from '@/components/DealViewSection';
import { ActivitySection } from '@/components/ActivitySection';
import { FinalCtaSection } from '@/components/FinalCtaSection';

export default function HomePage() {
  return (
    <>
      <div className="wrap">
        <HeroSection />
      </div>
      <MarketSection />
      <MechanismSection />
      <DealViewSection />
      <ActivitySection />
      <FinalCtaSection />
    </>
  );
}
