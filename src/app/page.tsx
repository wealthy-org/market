'use client';

import React from 'react';
import { GondiCarousel } from '@/components/GondiCarousel';
import { GondiMarketTable } from '@/components/GondiMarketTable';
import { GondiActivityFeed } from '@/components/GondiActivityFeed';
import { HomeExtraStrips, EarnYieldBanner } from '@/components/HomeExtraStrips';

export default function HomePage() {
  return (
    <div className="gondi-content-wrapper">
      <div className="gondi-center-feed">
        {/* Section 1: Featured Carousel matching Gondi Unique Listings */}
        <GondiCarousel />

        {/* Section 2: Market Overview Table matching Gondi Home */}
        <GondiMarketTable />

        {/* Earn Yield header */}
        <EarnYieldBanner />

        {/* Section 3: Repaying table (Gondi Refinancing, brief-aligned) */}
        <HomeExtraStrips />
      </div>

      {/* Right Column: Live Activity Feed */}
      <GondiActivityFeed />
    </div>
  );
}
