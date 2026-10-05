import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';
import { MarketProvider } from '@/context/MarketContext';
import { GondiSidebar } from '@/components/GondiSidebar';
import { GondiHeader } from '@/components/GondiHeader';
import { Footer } from '@/components/Footer';
import { ContributionModal } from '@/components/ContributionModal';
import { CreateRequestModal } from '@/components/CreateRequestModal';
import { WalletModalContainer } from '@/components/WalletModalContainer';
import { Toast } from '@/components/Toast';
import { TestnetPlayground } from '@/components/TestnetPlayground';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Pons Market · NFT & Token Creator Fee Financing on Robinhood Chain',
  description:
    'Back live token launches and NFT creators on Robinhood Chain with pooled ETH contributions. Upfront liquidity repaid automatically from future Pons V2 creator fee splits.',
  keywords: [
    'Pons V2',
    'Gondi UI',
    'Creator Fee Financing',
    'Robinhood Chain',
    'DEX Screener',
    'DeFi Lending',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Web3Provider>
          <MarketProvider>
            <div className="gondi-shell">
              <GondiSidebar />
              <div className="gondi-main-area">
                <GondiHeader />
                <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
                <Footer />
              </div>
            </div>
            <ContributionModal />
            <CreateRequestModal />
            <WalletModalContainer />
            <Toast />
            <TestnetPlayground />
          </MarketProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
