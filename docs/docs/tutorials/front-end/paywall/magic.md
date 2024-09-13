---
sidebar_position: 1
title: Magic
description: >-
  Learn how to add the Unlock Paywall to a magic application!
---

[Magic](https://magic.link/) gives developers the tools to make adoption frictionless, secure, and non-custodial. It provides an easy login mechanism via email to your users as well as gives them a non-custodial web3 wallet that they can use with your application.

:::note
Please find the code for this tutorial in [our examples repository](https://github.com/unlock-protocol/examples/tree/main/paywall/magic).
:::

For this, we started with the [Guide written by the Magic team](https://vercel.com/guides/add-auth-to-nextjs-with-magic) for Next.js but this should be applicable to any web framework.

At the end of the tutorial, our application provides users with the ability to easily login with a link sent to their email. When using the Magic library, your application can access the RPC provider to connect to the blockchain. We will leverage this to add the Paywall application and connect it to the user's wallet directly so users can easily check-out and purchase a membership.

:::warning
Magic currently only supports a limited set of chains (for example, no test networks are available as of writing). Your locks will need to be one of these chains. Similarly, you should not expect Magic users to have crypto-currencies to send the transactions themselves. For this we strongly recommend [enabling credit card purchases](https://unlock-protocol.com/guides/enabling-credit-cards/).
:::

1. Let's add the Paywall library

The library is a node module and can be added via `npm` or `yarn`. We also add the (optional) Unlock network package as it includes RPC endpoints you can optionally use. Feel free to replace them in your own application.

```shell
yarn add @unlock-protocol/paywall @unlock-protocol/networks
```

2. Let's add a button for users to checkout

Let's now add a button to our UI. In the `dashboard.js` file we replace the rendered components with the following

```javascript
const checkout = async () => {
  // TODO: complete me
  return false
}

return (
  <>
    {user?.issuer && (
      <>
        <h1>Dashboard</h1>
        <h2>Email</h2>
        <p>{user.email}</p>
        <h2>Wallet Address</h2>
        <p>{user.publicAddress}</p>
        <button onClick={checkout}>Checkout</button>
        <button onClick={logout}>Logout</button>
      </>
    )}
  </>
)
```

When the user clicks the `Checkout` button, the `checkout` function will be called.

3. Let's configure the paywall

At that point, we want to instantiate the paywall object and open it. First let's import the library:

```javascript
import { Paywall } from '@unlock-protocol/paywall'
import networks from '@unlock-protocol/networks'
```

And then, let's replace the `checkout` function with the following.

```javascript
const checkout = async () => {
  const paywallConfig = {
    locks: {
      '0xbf49ca4bf09d4b720fe5fcaecce0fe5d5b1becb9': {
        network: 137,
      },
    },
    skipRecipient: true,
    title: 'My Membership',
  }
  const paywall = new Paywall(paywallConfig, networks, magic.rpcProvider)
  paywall.loadCheckoutModal()
  return false
}
```

There is a little bit going on here. First, we create a [paywall config object](../../../tools/checkout/paywall.md). This is a JSON object that lets us configure the Paywall application. You can build that object manually or use the `Download JSON` from the [Checkout builder](https://app.unlock-protocol.com/locks/checkout-url) on the Unlock dashboard.

The one we use here is a pretty basic. We use a single lock at the address `0xbf49ca4bf09d4b720fe5fcaecce0fe5d5b1becb9`. We skip the step where users can change the recipient of the NFT they are purchasing and just use `My Membership` as the title on the modal.

The critical part here is this line:

```javascript
const paywall = new Paywall(paywallConfig, networks, magic.rpcProvider)
```

As you can see, we instantiate the paywall object with the following:

- the paywall config
- the networks package
- the [RPC provider served by Magic](https://magic.link/docs/auth/blockchains/celo#use-magic-rpc-provider)!

When instantiated with a provider, the paywall will use it rather than let the user choose their own.

Finally, we open the checkout modal by calling `paywall.loadCheckoutModal();`

:::note
A more robust design would probably instantiate the `Paywall` object in the `_app` component and then share it with all subcomponents as a context. This would avoid having to re-instantiate it every time the user clicks the `Checkout` button... but for this tutorial we chose simplicity!
:::
