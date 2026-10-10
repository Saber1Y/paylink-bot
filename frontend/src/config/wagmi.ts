import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { appChains, botMainnet, botTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: appChains,
  connectors: [injected()],
  transports: {
    [botMainnet.id]: http(),
    [botTestnet.id]: http(),
  },
  ssr: true,
});
