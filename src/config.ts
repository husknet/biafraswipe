// src/config.ts
import { http, createConfig } from '@wagmi/core';
import { mainnet, goerli } from '@wagmi/core/chains';

export const config = createConfig({
  chains: [mainnet, goerli],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
  },
});
