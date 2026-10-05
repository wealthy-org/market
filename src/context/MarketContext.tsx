'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { FundingDeal, LenderPosition, ActivityItem } from '@/types/market';
import { INITIAL_DEALS, INITIAL_POSITIONS, INITIAL_ACTIVITY, ETH_PRICE_USD } from '@/data/mockDeals';

interface MarketContextType {
  deals: FundingDeal[];
  positions: LenderPosition[];
  activity: ActivityItem[];
  selectedDeal: FundingDeal;
  setSelectedDealId: (id: string) => void;
  isWalletConnected: boolean;
  walletAddress: string;
  ethBalance: number;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  isWalletModalOpen: boolean;
  connectDemoWallet: () => void;
  disconnectWallet: () => void;
  contributeToPool: (dealId: string, amountUsd: number, customTxHash?: string) => { success: boolean; message?: string };
  claimRepayment: (positionId: string) => void;
  createNewRequest: (newDeal: Partial<FundingDeal>) => void;
  isContributionModalOpen: boolean;
  modalDeal: FundingDeal | null;
  openContributionModal: (deal: FundingDeal) => void;
  closeContributionModal: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  clearToast: () => void;
  simulateFeeInflow: (dealId: string, amountUsd: number) => void;
  simulatePoolFill: (dealId: string) => void;
  simulateExpireAndRefund: (dealId: string) => void;
  claimRefund: (dealId: string) => void;
  resetAllDemoState: () => void;
}


const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<FundingDeal[]>(INITIAL_DEALS);
  const [positions, setPositions] = useState<LenderPosition[]>(INITIAL_POSITIONS);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [selectedDealId, setSelectedDealIdState] = useState<string>('pny');

  // Wagmi live hooks
  const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: wagmiAddress,
  });

  // Demo fallback state (false by default so user starts disconnected)
  const [isDemoConnected, setIsDemoConnected] = useState<boolean>(false);
  const [demoAddress] = useState<string>('0x71C8A9e2b0F8103A82F');
  const [demoBalance, setDemoBalance] = useState<number>(4.85);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState<boolean>(false);
  const [modalDeal, setModalDeal] = useState<FundingDeal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch live deals from NeonDB via API route
  useEffect(() => {
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.deals?.length > 0) {
          setDeals((prev: FundingDeal[]): FundingDeal[] => {
            const apiMap = new Map<string, FundingDeal>(data.deals.map((d: FundingDeal) => [d.id, d]));
            const merged: FundingDeal[] = prev.map((p) => (apiMap.has(p.id) ? apiMap.get(p.id)! : p));
            data.deals.forEach((d: FundingDeal) => {
              if (!prev.some((p) => p.id === d.id)) {
                merged.push(d);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('API fetch deals error, using default mock deals:', err);
      });
  }, []);


  const isWalletConnected = isWagmiConnected || isDemoConnected;
  const walletAddress = isWagmiConnected && wagmiAddress ? wagmiAddress : demoAddress;
  const ethBalance = isWagmiConnected && balanceData ? parseFloat(formatEther(balanceData.value)) : demoBalance;

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  const clearToast = () => setToastMessage(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  const setSelectedDealId = (id: string) => {
    setSelectedDealIdState(id);
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const connectDemoWallet = () => {
    setIsDemoConnected(true);
    showToast('Connected Demo Testnet Wallet (4.85 ETH)');
  };

  const disconnectWallet = () => {
    if (isWagmiConnected) {
      wagmiDisconnect();
    }
    setIsDemoConnected(false);
    showToast('Wallet disconnected');
  };

  const openContributionModal = (deal: FundingDeal) => {
    setModalDeal(deal);
    setIsContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    setIsContributionModalOpen(false);
    setModalDeal(null);
  };

  const contributeToPool = (dealId: string, amountUsd: number, customTxHash?: string) => {
    if (!isWalletConnected) {
      openWalletModal();
      return { success: false, message: 'Please connect wallet first' };
    }

    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return { success: false, message: 'Deal not found' };

    const remaining = deal.campaignTargetUsd - deal.fundedUsd;
    const finalAmount = Math.min(amountUsd, remaining);
    if (finalAmount <= 0) return { success: false, message: 'Pool is already fully funded' };

    const costEth = finalAmount / ETH_PRICE_USD;
    if (ethBalance < costEth) {
      showToast('Insufficient ETH balance');
      return { success: false, message: 'Insufficient ETH balance' };
    }

    // Deduct ETH
    if (!isWagmiConnected) {
      setDemoBalance((prev) => +(prev - costEth).toFixed(4));
    }

    const newFunded = deal.fundedUsd + finalAmount;
    const isNowFilled = newFunded >= deal.campaignTargetUsd;

    // Update Deal
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          return {
            ...d,
            fundedUsd: newFunded,
            status: isNowFilled ? 'REPAYING' : d.status,
          };
        }
        return d;
      })
    );

    // Update or add Lender Position
    const poolShare = +((finalAmount / deal.campaignTargetUsd) * 100).toFixed(2);
    const existingPos = positions.find((p) => p.dealId === dealId && p.status === 'ACTIVE');

    if (existingPos) {
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === existingPos.id) {
            const updatedContrib = p.contributedUsd + finalAmount;
            return {
              ...p,
              contributedUsd: updatedContrib,
              contributedEth: +(updatedContrib / ETH_PRICE_USD).toFixed(4),
              poolSharePct: +((updatedContrib / deal.campaignTargetUsd) * 100).toFixed(2),
            };
          }
          return p;
        })
      );
    } else {
      const newPos: LenderPosition = {
        id: `pos-${Date.now()}`,
        dealId: deal.id,
        tokenSymbol: deal.token.symbol,
        tokenAvatar: deal.token.avatar,
        imageUrl: deal.token.imageUrl,
        campaignName: deal.campaignName,
        contributedUsd: finalAmount,
        contributedEth: +costEth.toFixed(4),
        poolSharePct: poolShare,
        repaidUsd: 0,
        repaidPct: 0,
        claimableUsd: 0,
        claimableEth: 0,
        status: 'ACTIVE',
        timestamp: 'Just now',
        splitterAddress: deal.splitterAddress,
      };
      setPositions((prev) => [newPos, ...prev]);
    }

    // Add Activity
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'CONTRIBUTION',
      dealId: deal.id,
      tokenSymbol: deal.token.symbol,
      tokenAvatar: deal.token.avatar,
      imageUrl: deal.token.imageUrl,
      amountUsd: finalAmount,
      amountEth: +costEth.toFixed(4),
      userAddress: walletAddress,
      txHash: customTxHash || `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      details: `Funded $${finalAmount} into ${deal.token.symbol} pool`,
    };

    setActivity((prev) => [newAct, ...prev]);


    if (isNowFilled) {
      const fillAct: ActivityItem = {
        id: `act-fill-${Date.now()}`,
        type: 'POOL_FILLED',
        dealId: deal.id,
        tokenSymbol: deal.token.symbol,
        tokenAvatar: deal.token.avatar,
        imageUrl: deal.token.imageUrl,
        amountUsd: deal.campaignTargetUsd,
        amountEth: +(deal.campaignTargetUsd / ETH_PRICE_USD).toFixed(4),
        userAddress: 'FundingPool Escrow',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...fill`,
        timestamp: 'Just now',
        details: `Pool filled 100%! Campaign escrow unlocked for execution.`,
      };
      setActivity((prev) => [fillAct, newAct, ...prev.slice(1)]);
    }

    showToast(`Successfully contributed $${finalAmount} (${costEth.toFixed(4)} ETH) to ${deal.token.symbol}!`);
    return { success: true, message: 'Contribution confirmed' };
  };

  const claimRepayment = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || pos.claimableUsd <= 0) {
      showToast('No claimable fees available for this position');
      return;
    }

    const claimedEth = pos.claimableEth;
    const claimedUsd = pos.claimableUsd;

    if (!isWagmiConnected) {
      setDemoBalance((prev) => +(prev + claimedEth).toFixed(4));
    }

    setPositions((prev) =>
      prev.map((p) => {
        if (p.id === positionId) {
          return {
            ...p,
            claimableUsd: 0,
            claimableEth: 0,
          };
        }
        return p;
      })
    );

    const claimAct: ActivityItem = {
      id: `claim-${Date.now()}`,
      type: 'REPAYMENT',
      dealId: pos.dealId,
      tokenSymbol: pos.tokenSymbol,
      tokenAvatar: pos.tokenAvatar,
      amountUsd: claimedUsd,
      amountEth: claimedEth,
      userAddress: walletAddress,
      txHash: `0xclaim...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      details: `Claimed $${claimedUsd.toFixed(2)} (${claimedEth.toFixed(4)} ETH) creator fee yield`,
    };

    setActivity((prev) => [claimAct, ...prev]);
    showToast(`Claimed $${claimedUsd.toFixed(2)} (${claimedEth.toFixed(4)} ETH) successfully!`);
  };

  const createNewRequest = (newDealData: Partial<FundingDeal>) => {
    const symbol = newDealData.token?.symbol || '$TOKEN';
    const avatar = symbol.replace('$', '').slice(0, 3).toUpperCase();
    const dealId = symbol.toLowerCase().replace('$', '');

    const newDeal: FundingDeal = {
      id: dealId,
      token: {
        name: newDealData.token?.name || 'Community Token',
        symbol: symbol,
        address: newDealData.token?.address || `0x${Math.random().toString(16).substring(2, 12)}...`,
        avatar: avatar,
        age: '16m',
        chain: 'Robinhood Chain',
        pairToken: 'WETH',
        creatorAddress: walletAddress,
        imageUrl: newDealData.token?.imageUrl || 'https://lh3.googleusercontent.com/TbbppD5KJwxtyLaGM4dtCnLtMlwslnP2Tf1YJxQFSZqGwwmxTbZB_aIvp0mcIdd4UJg5O7W2PjXCoJ4DT7wKP3S_cbhb2JXGLTFb',
      },
      status: 'LIVE',
      feeVelocity: 42,
      feeVelocityTrend: 15,
      trendDirection: 'up',
      rollingFees: {
        m5: 3.5,
        m15: 11.2,
        h1: 42.0,
        h6: 120.0,
        h24: 290.0,
      },
      liquidityUsd: 12500,
      marketCapUsd: 26000,
      uniqueTraders: 55,
      campaignName: newDealData.campaignName || 'DEX Screener Paid',
      campaignTargetUsd: 299,
      fundedUsd: 0,
      lenderFeeSharePct: newDealData.lenderFeeSharePct || 70,
      creatorFeeSharePct: 100 - (newDealData.lenderFeeSharePct || 70),
      repayCapMultiplier: 1.20,
      projectedPaybackHours: 8.5,
      creatorFeesAccruedUsd: 28.5,
      repaidToLendersUsd: 0,
      chartData: [
        { time: '15m ago', velocity: 22 },
        { time: '10m ago', velocity: 30 },
        { time: '5m ago', velocity: 38 },
        { time: 'Now', velocity: 42 },
      ],
      eligibility: {
        ageMinutes: 16,
        ageOk: true,
        uniqueTraders: 55,
        tradersOk: true,
        creatorFeesUsd: 28.5,
        feesOk: true,
        recipientTransferable: true,
        isEligible: true,
      },
      createdAt: 'Just now',
      splitterAddress: `0xSplitter${Math.random().toString(16).substring(2, 8)}`,
    };

    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDealIdState(newDeal.id);

    const act: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'REQUEST_CREATED',
      dealId: newDeal.id,
      tokenSymbol: newDeal.token.symbol,
      tokenAvatar: newDeal.token.avatar,
      imageUrl: newDeal.token.imageUrl,
      amountUsd: 299,
      userAddress: walletAddress,
      txHash: `0xreq...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      details: `Created launch pool for ${newDeal.token.symbol} (DEX Screener Paid · $299)`,
    };

    setActivity((prev) => [act, ...prev]);
    showToast(`Funding pool for ${newDeal.token.symbol} opened successfully!`);
    setIsCreateModalOpen(false);

    // Persist new deal to NeonDB
    try {
      fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      }).catch((e) => console.warn('Could not persist deal to NeonDB:', e));
    } catch (e) {
      // background sync
    }
  };


  const simulateFeeInflow = (dealId: string, amountUsd: number) => {
    const targetDeal = deals.find((d) => d.id === dealId) || selectedDeal;
    if (!targetDeal) return;

    const lenderShareUsd = amountUsd * (targetDeal.lenderFeeSharePct / 100);
    const creatorShareUsd = amountUsd * (targetDeal.creatorFeeSharePct / 100);
    const newFeesAccrued = targetDeal.creatorFeesAccruedUsd + amountUsd;
    const newRepaidToLenders = targetDeal.repaidToLendersUsd + lenderShareUsd;
    const maxRepayCapUsd = targetDeal.campaignTargetUsd * targetDeal.repayCapMultiplier;
    const isNowFullyRepaid = newRepaidToLenders >= maxRepayCapUsd;

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === targetDeal.id) {
          return {
            ...d,
            creatorFeesAccruedUsd: newFeesAccrued,
            repaidToLendersUsd: isNowFullyRepaid ? maxRepayCapUsd : newRepaidToLenders,
            status: isNowFullyRepaid ? 'REPAID' : (d.status === 'LIVE' || d.status === 'MOMENTUM' ? 'REPAYING' : d.status),
          };
        }
        return d;
      })
    );

    setPositions((prev) =>
      prev.map((p) => {
        if (p.dealId === targetDeal.id && p.status !== 'REPAID') {
          const myShareUsd = +(lenderShareUsd * (p.poolSharePct / 100)).toFixed(2);
          const myShareEth = +(myShareUsd / ETH_PRICE_USD).toFixed(4);
          const updatedRepaid = +(p.repaidUsd + myShareUsd).toFixed(2);
          const capForPos = +(p.contributedUsd * 1.20).toFixed(2);
          const isPosRepaid = updatedRepaid >= capForPos;
          const cappedRepaid = isPosRepaid ? capForPos : updatedRepaid;

          return {
            ...p,
            repaidUsd: cappedRepaid,
            repaidPct: Math.min(100, Math.round((cappedRepaid / capForPos) * 100)),
            claimableUsd: +(p.claimableUsd + myShareUsd).toFixed(2),
            claimableEth: +(p.claimableEth + myShareEth).toFixed(4),
            status: isPosRepaid ? 'REPAID' : p.status,
          };
        }
        return p;
      })
    );

    const act: ActivityItem = {
      id: `fee-${Date.now()}`,
      type: 'REPAYMENT',
      dealId: targetDeal.id,
      tokenSymbol: targetDeal.token.symbol,
      tokenAvatar: targetDeal.token.avatar,
      imageUrl: targetDeal.token.imageUrl,
      amountUsd: amountUsd,
      amountEth: +(amountUsd / ETH_PRICE_USD).toFixed(4),
      userAddress: 'Pons V2 Fee Router',
      txHash: `0xfee...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      details: isNowFullyRepaid
        ? `1.20x Cap Hit! Fee recipient automatically returned to creator.`
        : `Routed $${amountUsd} fees ($${lenderShareUsd.toFixed(2)} to lenders, $${creatorShareUsd.toFixed(2)} to creator)`,
    };
    setActivity((prev) => [act, ...prev]);

    if (isNowFullyRepaid) {
      showToast(`🎉 1.20x Cap reached on ${targetDeal.token.symbol}! Fee rights returned to creator.`);
    } else {
      showToast(`Streamed $${amountUsd} Pons fees: $${lenderShareUsd.toFixed(2)} routed to lenders`);
    }
  };

  const simulatePoolFill = (dealId: string) => {
    const targetDeal = deals.find((d) => d.id === dealId) || selectedDeal;
    if (!targetDeal) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === targetDeal.id ? { ...d, fundedUsd: d.campaignTargetUsd, status: 'REPAYING' } : d))
    );

    const act: ActivityItem = {
      id: `fill-${Date.now()}`,
      type: 'POOL_FILLED',
      dealId: targetDeal.id,
      tokenSymbol: targetDeal.token.symbol,
      tokenAvatar: targetDeal.token.avatar,
      imageUrl: targetDeal.token.imageUrl,
      amountUsd: targetDeal.campaignTargetUsd,
      amountEth: +(targetDeal.campaignTargetUsd / ETH_PRICE_USD).toFixed(4),
      userAddress: 'FinanceSplitter Deployed',
      txHash: `0xfill...${Math.random().toString(16).substring(2, 6)}`,
      timestamp: 'Just now',
      details: `100% Filled! Deployed FinanceSplitter & CampaignEscrow on Robinhood Chain.`,
    };
    setActivity((prev) => [act, ...prev]);
    showToast(`Pool filled 100%! FinanceSplitter active on ${targetDeal.token.symbol}`);
  };

  const simulateExpireAndRefund = (dealId: string) => {
    const targetDeal = deals.find((d) => d.id === dealId) || selectedDeal;
    if (!targetDeal) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === targetDeal.id ? { ...d, status: 'LIVE' } : d))
    );

    showToast(`Simulated pool expiration. 100% refunds enabled.`);
  };

  const claimRefund = (dealId: string) => {
    const userPositions = positions.filter((p) => p.dealId === dealId);
    if (userPositions.length === 0) {
      showToast('No contribution found for this pool');
      return;
    }
    const refundEth = userPositions.reduce((acc, p) => acc + p.contributedEth, 0);
    const refundUsd = userPositions.reduce((acc, p) => acc + p.contributedUsd, 0);

    if (!isWagmiConnected) {
      setDemoBalance((prev) => +(prev + refundEth).toFixed(4));
    }
    setPositions((prev) => prev.filter((p) => p.dealId !== dealId));

    showToast(`Refund of $${refundUsd} (${refundEth.toFixed(4)} ETH) claimed successfully!`);
  };

  const resetAllDemoState = () => {
    setDeals(INITIAL_DEALS);
    setPositions(INITIAL_POSITIONS);
    setActivity(INITIAL_ACTIVITY);
    setDemoBalance(4.85);
    showToast('Reset all testnet states to default');
  };


  return (
    <MarketContext.Provider
      value={{
        deals,
        positions,
        activity,
        selectedDeal,
        setSelectedDealId,
        isWalletConnected,
        walletAddress,
        ethBalance,
        openWalletModal,
        closeWalletModal,
        isWalletModalOpen,
        connectDemoWallet,
        disconnectWallet,
        contributeToPool,
        claimRepayment,
        createNewRequest,
        isContributionModalOpen,
        modalDeal,
        openContributionModal,
        closeContributionModal,
        isCreateModalOpen,
        setIsCreateModalOpen,
        toastMessage,
        clearToast,
        simulateFeeInflow,
        simulatePoolFill,
        simulateExpireAndRefund,
        claimRefund,
        resetAllDemoState,
      }}

    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
