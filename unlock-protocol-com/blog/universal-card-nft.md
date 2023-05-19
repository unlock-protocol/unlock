---
title: Stripe Onramp Support!
subTitle: Purchase any membership using your payment card!
description: Today, we’re excited to introduce a new way to purchase Unlock memberships with Stripe!
author: Julien Genestoux
publishDate: May 19, 2023
image: /images/blog/credit-card-onramp.png
---

Today, we’re excited to introduce a new way to purchase Unlock memberships with Stripe!

![Credit card NFT Onramp](/images/blog/credit-card-onramp.png)

Stripe [recently announced](https://stripe.com/blog/crypto-onramp) a new on-ramp mechanism and it is a great match for our membership contracts. You can test it today by buying a membership on this lock TK. (We’re happy to refund you if you ask!).

We have had [support for credit card payments](https://unlock-protocol.com/guides/enabling-credit-cards/) for a few years now. However, this legacy credit card payment implementation required lock managers (who deployed the membership contracts) to connect their smart contract(s) to Stripe’s payment gateway using Stripe Connect. This works great, and we’re keeping this option, but is limited in scope as [Stripe Connect](https://stripe.com/connect) is not available in every country or for any kind of business.

With Stripe On Ramp, we’re adding support for credit card payments on a lock, even if the lock manager themselves has not connected with Stripe! For now, this feature works only for locks deployed on _Polygon_ and _Ethereum Mainnet_, and only for locks priced in USDC, but soon, using our [swap and purchase](https://unlock-protocol.com/blog/swap-and-purchase) capabilities, this will be available for locks in _any_ currency, provided that there is a way to convert from USDC to that currency, and for all the networks that Stripe will add support for.

## How does it work?

First, I should mention that it works for both for users who have their own wallets, as well as for users who don’t have a wallet (using their [Unlock Account](https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/unlock-accounts/)).

When the user selects the option to checkout with Stripe’s onRamp, we ask them to sign two messages (these are just signatures, without any gas spent). The first message to sign is an **approval** to spend the funds they will receive from Stripe, immediately after they received them. The second one is a confirmation that they want to spend these funds for a **specific** membership contract.

These two signatures are critical for security and helps ensure the funds they receive from Stripe cannot be spent for anything else.

Once they have signed these two transactions, they will follow the Stripe checkout flow (the one that you already find on many websites around the world). At the end of it, Stripe sends [USDC](https://www.circle.com/en/usdc) to their address and Unlock Labs triggers a transaction that uses the two signatures they provided earlier to instantly spend these USDC tokens and purchase the NFT membership for them.

## Next Steps

Like always in the crypto space, we’re learning as we explore! The obvious next step for us to to add support for our “swap and purchase” flow. This would add support to memberships priced in **any** currency, not just USDC. The flow would be nearly identical from a user’s perspective, but instead of using the USDC to purchase the membership, our contract will instantly swap it for the right amount of tokens required to purchase the membership.

Stripe has indicated that they will add support for more chains and L2s. We will of course add support for these chains as soon as they do! Finally, Stripe has also indicated that they want to explore support for recurring purchases, which we would be thrilled to add support for, on top of our native [crypto recurring payments](https://unlock-protocol.com/guides/recurring-memberships/).
