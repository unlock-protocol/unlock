---
title: Multichain support in paywall
subTitle: You can now embed locks from multiple chain in the same application!
authorName: Julien Genestoux
publishDate: May 11, 2021
description: You can now embed locks from multiple chain in the same application! Also, you can customize the configuration for the checkout modal, independently of the paywall configuration!
image: /images/blog/xdai/xdai.png
---

As transaction costs on Ethereum's mainnet keep sky-rocketing (it's a good thing!), like many other projects in the web3 space, we are exploring ways to provide a seamless experience in the Ethereum ecosystem, without the costs associated with a blockchain used heavily for large-value transactions. A few weeks ago, we launch the [Unlock Protocol on xDAI](/blog/xdai) and we're working on several more.

Unfortunately, there is a cost to using multiple chains: complexity for users. We have many ideas on how to improve that, and that's one of the main areas of focus over the next months, but today, we're proud to introduce our support for what we call a **multi-chain paywall**: a way for the paywall application to connect to several locks at once, on different chains!

The configuration for these is simple: just pass the network as part of the locks' custom values:

```
{
  locks: {
    "0xb77030a7e47a5eb942a4748000125e70be598632": {
      name: "Unlock Community",
      network: 137,
    }
  }
```

Additionally, we've added a feature to the paywall which lets developers configure which locks are shown when the user is making a purchase. For this, the `loadCheckoutModal` function now accepts an optional config (and defaults to the one used on the page). [Thanks a lot to [Paul](https://twitter.com/pswgnr) from the Unlock community [for his suggestion](https://github.com/unlock-protocol/unlock/issues/7072)!]
