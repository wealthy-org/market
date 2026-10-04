import { http, createConfig } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { robinhoodTestnet, robinhoodMainnet } from './chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [robinhoodTestnet, robinhoodMainnet],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [robinhoodTestnet.id]: http(),
    [robinhoodMainnet.id]: http(),
  },
  ssr: true,
});
