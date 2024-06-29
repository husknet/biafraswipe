import { type Config, getClient, getConnectorClient } from '@wagmi/core';
import { providers } from 'ethers';
import type { Client, Chain, Transport, Account } from 'viem';

export function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    );
  return new providers.JsonRpcProvider(transport.url, network);
}

export function getEthersProvider(config, { chainId } = {}) {
  const client = getClient(config, { chainId });
  if (!client) return;
  return clientToProvider(client);
}

export function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

export async function getEthersSigner(config, { chainId } = {}) {
  const client = await getConnectorClient(config, { chainId });
  return clientToSigner(client);
}
