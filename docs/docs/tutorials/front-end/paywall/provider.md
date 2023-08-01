---
sidebar_position: 2
title: Provider
description: >-
  Learn how to use unlock authentication modal as a provider!
---

Unlock provides an authentication modal you can embed on your site to quickly support wallet and unlock account users to login to your site.

:::note
Please find the code for this tutorial in [our examples repository](https://github.com/unlock-protocol/examples/tree/main/examples/paywall/provider).
:::

For this, we will start with a new vite application. Let's create a new react application with the following command:

```shell
npm create vite@latest custom_app # select react typescript template
```

1. Let's add the Paywall library and dependencies

We also add the (optional) Unlock network package as it includes RPC endpoints you can optionally use. Feel free to replace them in your own application.

```shell
npm install @unlock-protocol/paywall @unlock-protocol/networks ethers@5.7.x wagmi viem react react-dom
```

2. Let's setup wagmi provider in our `src/index.tsx` file

```jsx
import { createRoot } from 'react-dom/client'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { Profile } from './profile'

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
})

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
    </WagmiConfig>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
```

3. We will create the Profile component in a separate file `src/profile.tsx`

Create a new file `src/profile.tsx` with the following content:

```jsx
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Paywall } from "@unlock-protocol/paywall";
import { networks } from "@unlock-protocol/networks";
import { useMemo, useState } from "react";
import { WalletService } from "@unlock-protocol/unlock-js";
import { ethers } from "ethers";

export function Profile() {
  const { address, isConnected } = useAccount();
  // Create a provider using the Paywall library
  const provider = useMemo(() => {
    const paywall = new Paywall(networks);
    return paywall.getProvider("http://localhost:3000"); // Replace me with the URL of your Unlock instance
  }, []);

  const { connect } = useConnect({
    connector: new InjectedConnector({
      options: {
        name: "Unlock Paywall Provider",
        getProvider: () => {
          // Return the provider we created earlier
          return provider;
        },
      },
    }),
  });

  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);

  if (isConnected) {
    return (
      <div>
        Connected to {address}
        <button
          onClick={() => {
            disconnect();
          }}
        >
          Disconnect
        </button>
        <button
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              // Create a wallet service using the provider
              const web3Provider = new ethers.providers.Web3Provider(provider);
              const wallet = new WalletService(networks);
              // Connect the wallet to the provider
              await wallet.connect(web3Provider);
              // Create a lock
              await wallet.createLock({
                name: "Demo lock",
                keyPrice: "0",
                maxNumberOfKeys: 100,
                expirationDuration: 100,
              });
            } catch (error) {
              console.error(error);
            }
            setIsLoading(false);
          }}
        >
          {isLoading ? "Creating lock..." : "Create Lock"}
        </button>
      </div>
    );
  }
  return (
    // This is the button that will trigger the authentication modal
    <button
      onClick={() => {
        connect();
      }}
    >
      Connect
    </button>
  );
}
```

When the user clicks the `Connect` button, the modal will open and the user will be able to choose their provider. Once they do, the modal will close and the user will be connected to your site.

:::note
A more robust design would probably instantiate the `Paywall` object in the `_app` component and then share it with all subcomponents as a context. This would avoid having to re-instantiate it every time the user clicks the `Checkout` button... but for this tutorial we chose simplicity!
:::
