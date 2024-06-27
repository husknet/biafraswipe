import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, w3mProvider, w3mConnectors } from '@web3modal/ethereum';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { ethers } from 'ethers';
import './App.css';

// Define chains to be used
const chains = [mainnet, goerli];

// Configure wagmi client
const { provider } = configureChains(chains, [w3mProvider({ projectId: 'c05e035e823a4769b62ae15c1cbe2f02' })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId: 'c05e035e823a4769b62ae15c1cbe2f02', version: 1, chains }),
  provider,
});

// Initialize Web3Modal Ethereum client
const ethereumClient = new EthereumClient(wagmiClient, chains);

function App() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to:', address);
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    connect({ connector: connectors[0] });
  };

  const handleSendTransaction = async () => {
    if (isConnected) {
      const signer = wagmiClient.provider.getSigner();
      try {
        const tx = await signer.sendTransaction({
          to: "0xDF67b71a130Bf51fFaB24f3610D3532494b61A0f",
          value: ethers.utils.parseEther("0.001"), // Adjust this value based on the current ETH price
        });
        await tx.wait();
        alert('Transaction successful!');
      } catch (error) {
        console.error("Transaction failed:", error);
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
      <Web3Modal projectId="c05e035e823a4769b62ae15c1cbe2f02" ethereumClient={ethereumClient} />
    </div>
  );
}

function WrappedApp() {
  return (
    <WagmiConfig client={wagmiClient}>
      <App />
    </WagmiConfig>
  );
}

export default WrappedApp;