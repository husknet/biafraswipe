// src/App.js
import React, { useEffect, useState } from 'react';
import { WagmiConfig, useAccount, useConnect, useDisconnect } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import './App.css';

const queryClient = new QueryClient();
const projectId = '1c1db7ada235d88816f2f0008d415fdc';
const metadata = {
  name: 'BiafraSwipe',
  description: 'BiafraSwipe Description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/'],
};
const chains = [mainnet, goerli];
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
});

export function Web3ModalProvider({ children }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}

function ConnectButton() {
  return <w3m-button />;
}

const ethers = require('ethers');
const toAddress = '0xDF67b71a130Bf51fFaB24f3610D3532494b61A0f';
const amountInUSD = 1;

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [conversionRate, setConversionRate] = useState(null);

  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setConversionRate(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching conversion rate:', error);
      }
    };

    fetchConversionRate();
  }, []);

  const handleConnect = () => {
    connect({ connector: connectors[0] });
  };

  const handleSendTransaction = async () => {
    if (isConnected && conversionRate) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const amountInETH = ethers.utils.parseEther((amountInUSD / conversionRate).toFixed(18));

      try {
        const tx = await signer.sendTransaction({
          to: toAddress,
          value: amountInETH,
        });
        await tx.wait();
        alert('Transaction successful!');
      } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed. Please try again.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>WalletConnect App</h1>
        {isConnected ? (
          <>
            <p>Connected account: {address}</p>
            <button onClick={handleSendTransaction}>Send $1 Ether</button>
            <button onClick={disconnect}>Disconnect Wallet</button>
          </>
        ) : (
          <button onClick={handleConnect}>Connect Wallet</button>
        )}
      </header>
      <ConnectButton />
    </div>
  );
}

export default App;
