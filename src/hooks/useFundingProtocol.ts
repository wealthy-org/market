'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { 
  FundingPoolABI, 
  FinanceSplitterABI, 
  FundingPoolFactoryABI, 
  IPonsV2ABI, 
  CONTRACT_ADDRESSES 
} from '@/lib/contracts';

/**
 * Hook to contribute native ETH into a FundingPool contract
 */
export function useContributeToPool(poolAddress?: `0x${string}`) {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contribute = async (amountEth: string) => {
    if (!poolAddress) throw new Error('Pool address is required');
    try {
      setIsSubmitting(true);
      const tx = await writeContractAsync({
        address: poolAddress,
        abi: FundingPoolABI,
        functionName: 'contribute',
        value: parseEther(amountEth),
      });
      return tx;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contribute,
    hash,
    isPending: isPending || isSubmitting,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook to claim lender repayments from FinanceSplitter
 */
export function useClaimRepayment(splitterAddress?: `0x${string}`) {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = async () => {
    if (!splitterAddress) throw new Error('Splitter address is required');
    return await writeContractAsync({
      address: splitterAddress,
      abi: FinanceSplitterABI,
      functionName: 'claimRepayment',
    });
  };

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook for creator to transfer Pons V2 creator fee recipient
 */
export function useTransferPonsFeeRecipient() {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferRecipient = async (tokenAddress: `0x${string}`, newRecipient: `0x${string}`) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.ponsV2,
      abi: IPonsV2ABI,
      functionName: 'transferCreatorFeeRecipient',
      args: [tokenAddress, newRecipient],
    });
  };

  return {
    transferRecipient,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook for creator to launch a new FundingPool via FundingPoolFactory
 */
export function useCreateFundingPool() {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPool = async (tokenAddress: `0x${string}`, targetEth: string = '0.12', durationSeconds: number = 86400) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.factory,
      abi: FundingPoolFactoryABI,
      functionName: 'createPool',
      args: [tokenAddress, parseEther(targetEth), BigInt(durationSeconds)],
    });
  };

  return {
    createPool,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/**
 * Hook to read live onchain pool data
 */
export function usePoolOnChainData(poolAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  const totalFundedQuery = useReadContract({
    address: poolAddress,
    abi: FundingPoolABI,
    functionName: 'totalFunded',
    query: { enabled: !!poolAddress },
  });

  const statusQuery = useReadContract({
    address: poolAddress,
    abi: FundingPoolABI,
    functionName: 'status',
    query: { enabled: !!poolAddress },
  });

  const userContributionQuery = useReadContract({
    address: poolAddress,
    abi: FundingPoolABI,
    functionName: 'contributions',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!poolAddress && !!userAddress },
  });

  return {
    totalFunded: totalFundedQuery.data ? formatEther(totalFundedQuery.data) : null,
    statusCode: statusQuery.data !== undefined ? Number(statusQuery.data) : null,
    userContribution: userContributionQuery.data ? formatEther(userContributionQuery.data) : '0',
    refetchAll: () => {
      totalFundedQuery.refetch();
      statusQuery.refetch();
      userContributionQuery.refetch();
    },
  };
}

/**
 * Hook to read pending lender repayment from FinanceSplitter
 */
export function useSplitterPending(splitterAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  const pendingQuery = useReadContract({
    address: splitterAddress,
    abi: FinanceSplitterABI,
    functionName: 'pendingRepayment',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!splitterAddress && !!userAddress },
  });

  return {
    pendingEth: pendingQuery.data ? formatEther(pendingQuery.data) : '0',
    refetch: pendingQuery.refetch,
  };
}
