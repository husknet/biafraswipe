// src/ethersAdapters.js
import { getClient, getConnectorClient } from '@wagmi/core';
import { ethers } from 'ethers';

export function clientToProvider(client) {
  const { chain } = client;
  const network = chain.name || chain.id;
  return ethers.getDefaultProvider(network, {
    infura: 'c05e035e823a4769b62ae15c1cbe2f02',
  });
}

export function getEthersProvider(config, { chainId } = {}) {
  const client = getClient(config, { chainId });
  if (!client) return;
  return clientToProvider(client);
}

export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = chain.name || chain.id;
  const provider = ethers.getDefaultProvider(network, {
    infura: 'c05e035e823a4769b62ae15c1cbe2f02',
  });
  const signer = provider.getSigner(account.address);
  return signer;
}

export async function getEthersSigner(config, { chainId } = {}) {
  const client = await getConnectorClient(config, { chainId });
  return clientToSigner(client);
}
