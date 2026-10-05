'use client';

import React from 'react';
import { GondiStatsBanner } from '@/components/GondiStatsBanner';
import { GondiCarousel } from '@/components/GondiCarousel';
import { GondiMarketTable } from '@/components/GondiMarketTable';
import { DealViewSection } from '@/components/DealViewSection';
import { MechanismSection } from '@/components/MechanismSection';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';

export default function HomePage() {
  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed">
        <GondiStatsBanner />
        <GondiCarousel />
        <GondiMarketTable />
        <DealViewSection />
        <MechanismSection />
      </div>
      <GondiActivityFeed />
    </div>
  );
}
