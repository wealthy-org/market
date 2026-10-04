export type DealStatus = 'LIVE' | 'MOMENTUM' | 'HOT' | 'RECENTLY_FUNDED' | 'REPAYING' | 'REPAID';

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  avatar: string;
  age: string;
  chain: string;
  pairToken: string;
  creatorAddress: string;
}

export interface EligibilityStatus {
  ageMinutes: number;
  ageOk: boolean;
  uniqueTraders: number;
  tradersOk: boolean;
  creatorFeesUsd: number;
  feesOk: boolean;
  recipientTransferable: boolean;
  isEligible: boolean;
}

export interface ChartPoint {
  time: string;
  velocity: number;
}

export interface FundingDeal {
  id: string;
  token: TokenInfo;
  status: DealStatus;
  feeVelocity: number; // e.g. $48/hr
  feeVelocityTrend: number; // e.g. +22%
  trendDirection: 'up' | 'down';
  rollingFees: {
    m5: number;
    m15: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidityUsd: number;
  marketCapUsd: number;
  uniqueTraders: number;
  campaignName: string; // e.g. "DEX Screener Paid"
  campaignTargetUsd: number; // 299
  fundedUsd: number; // e.g. 215
  lenderFeeSharePct: number; // e.g. 70
  creatorFeeSharePct: number; // e.g. 30
  repayCapMultiplier: number; // e.g. 1.20
  projectedPaybackHours: number; // e.g. 10.7
  creatorFeesAccruedUsd: number; // e.g. 47.82
  repaidToLendersUsd: number; // e.g. 150.50
  chartData: ChartPoint[];
  eligibility: EligibilityStatus;
  createdAt: string;
  splitterAddress: string;
}

export interface LenderPosition {
  id: string;
  dealId: string;
  tokenSymbol: string;
  tokenAvatar: string;
  campaignName: string;
  contributedUsd: number;
  contributedEth: number;
  poolSharePct: number;
  repaidUsd: number;
  repaidPct: number;
  claimableUsd: number;
  claimableEth: number;
  status: 'ACTIVE' | 'COOLING' | 'REPAID';
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: 'CONTRIBUTION' | 'POOL_FILLED' | 'CAMPAIGN_EXECUTED' | 'REPAYMENT' | 'REQUEST_CREATED';
  dealId: string;
  tokenSymbol: string;
  tokenAvatar: string;
  amountUsd?: number;
  amountEth?: number;
  userAddress: string;
  txHash: string;
  timestamp: string;
  details: string;
}
