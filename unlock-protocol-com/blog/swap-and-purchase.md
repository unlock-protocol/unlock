---
title: 'Introducing Swap & Purchase: Streamlined NFT Buying Experience in Unlock Checkout'
subTitle: Buy NFTs priced in any token you hold using swap and purchase
authorName: searchableguy
publishDate: 5 April, 2023
description: Buy NFTs priced in any token you hold using swap and purchase
image: /images/blog/swap-and-purchase/swap-and-purchase.png
---

![Checkout Payments page](/images/blog/swap-and-purchase/swap-and-purchase.png)

We're thrilled to announce the latest addition to Unlock: Swap & Purchase in Unlock Checkout.

By leveraging an external contract powered by Uniswap, Swap & Purchase in Unlock Checkout enables a user to buy a membership NFT even if it’s priced in a different currency than the currency a purchaser holds in their wallet. There's no need for users to perform the swap, as it happens natively. For example, if an NFT is priced in USDC but the purchaser only holds MATIC in their wallet, Swap & Purchase will swap enough MATIC for the correct amount of USDC in a single step, making things easier for the purchaser and enabling the creator to be paid in the currency of their choice. This simplifies the process and reduces friction for both creators and purchasers.

[Try it out now](https://app.unlock-protocol.com/checkout?id=bb4a2ae0-2fca-4bdf-bd40-f0c41cde2510)

In Swap & Purchase, the Unlock interface will show options to buy the NFT membership in alternative tokens to users automatically on the payment screen. Currently, we will display stable-coin as options such as USDC or USDT. In future, we might open up to checking more routes and enabling more arbitrary swaps.

### How does this work?

We created a new `UnlockSwapPurchaser` contract which facilitates exchanging tokens and purchasing NFTs on behalf of users in a single transaction. This contract has been deployed on all the [networks supported by Unlock](https://docs.unlock-protocol.com/core-protocol/unlock/networks). When a user loads the checkout UI, we immediately check what other currencies they have in their wallets and see if any could be used to perform the purchase. We encode the Lock contract function with parameters as `callData` and pass it to the `swapAndCall` function on the `UnlockSwapPurchaser` contract. This then does the swap, and uses `callData` to call the function with parameters on the PublicLock contract.

This allows us to make the currency swap work with any function on our PublicLock contract if it requires a payment.
