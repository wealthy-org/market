'use client';

import React from 'react';
import { useMarket } from '@/context/MarketContext';
import { ConnectWalletModal } from './ConnectWalletModal';

export const WalletModalContainer: React.FC = () => {
  const { isWalletModalOpen, closeWalletModal } = useMarket();

  return (
    <ConnectWalletModal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
    />
  );
};
