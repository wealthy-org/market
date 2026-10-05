import { FundingPoolABI } from '@/abi/FundingPoolABI';
import { FinanceSplitterABI } from '@/abi/FinanceSplitterABI';
import { FundingPoolFactoryABI } from '@/abi/FundingPoolFactoryABI';
import { IPonsV2ABI } from '@/abi/IPonsV2ABI';

export {
  FundingPoolABI,
  FinanceSplitterABI,
  FundingPoolFactoryABI,
  IPonsV2ABI,
};

import deployments from '@/data/deployments.json';

// Default Protocol Addresses (configurable via ENV or deployments.json)
export const CONTRACT_ADDRESSES = {
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || deployments.factory) as `0x${string}`,
  ponsV2: (process.env.NEXT_PUBLIC_PONS_ADDRESS || deployments.ponsV2) as `0x${string}`,
  protocolTreasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x9178B573219C55586BbAf51Ecb24ACfb27BB7681') as `0x${string}`,
  samplePool: (process.env.NEXT_PUBLIC_SAMPLE_POOL || deployments.samplePool) as `0x${string}`,
};

