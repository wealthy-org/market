import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';
import { MarketProvider } from '@/context/MarketContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ContributionModal } from '@/components/ContributionModal';
import { CreateRequestModal } from '@/components/CreateRequestModal';
import { WalletModalContainer } from '@/components/WalletModalContainer';
import { Toast } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Launch Funding Market · Pons V2 Creator Fee Financing',
  description:
    'Back live token launches on Robinhood Chain with pooled ETH contributions. Campaign costs funded upfront, repaid automatically from future Pons creator fees.',
  keywords: [
    'Pons V2',
    'Creator Fee Financing',
    'Robinhood Chain',
    'DEX Screener',
    'DeFi',
    'Launch Market',
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
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ContributionModal />
            <CreateRequestModal />
            <WalletModalContainer />
            <Toast />
          </MarketProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
