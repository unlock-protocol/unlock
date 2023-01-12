---
title: Credit Card Support
authorName: Julien Genestoux
publishDate: June 15, 2021
description: We’re excited to announce that unlock now has ✨credit card✨ support, for all locks, on any network!
image: /images/blog/unlock-credit-card/card-membership.png
---

![Unlock with credit card](/images/blog/unlock-credit-card/card-membership.png)

We’re excited to announce that unlock now has ✨credit card✨ support! This means that if your customers don’t use crypto, they can still buy memberships and products right from your website!

We’ve made it really easy for you to set up. You can see the [full documentation for this here](https://unlock-protocol.com/guides/enabling-credit-cards/).

How does it work? We handle payment through [Stripe](https://stripe.com/), so you’ll need to make sure you’re verified first with a Stripe account.

Behind the scenes, we rely on [Stripe Connect](https://stripe.com/connect), which means that you will receive payments "off-chain" directly on the bank account that you have set-up with Stripe. The funds do not transit through Unlock and they go directly from your member's card payments to your Stripe account.

# How to enable credit cards on your lock

‌
**Prerequisites**
‌

- Your lock needs to be priced in a currency for which [Coinbase has a conversion](https://developers.coinbase.com/api/v2#exchange-rates) price in USD.
- Your lock's price in USD needs to be at least $0.50.
  ‌

## Connecting a Stripe Account

The first step, if your lock is eligible, is to connect your lock to a Stripe account. For this, connect to the Unlock Dashboard. Then, click on the Credit Card button on your lock's toolbar.

![enabling card](/images/blog/unlock-credit-card/enabling-card-payment.png)
‌
Once the Credit Card pane is displayed, click on the "Connect Stripe" button. When clicking you will first be prompted to sign a message confirming that you own that lock (any lock manager can do that) and that you want to enable credit card payments for it. Once confirmed, you will be redirected to the Stripe Website, where you need to follow multiple steps, including connecting a bank account, and providing informations about your identity.

![stripe connect](/images/blog/unlock-credit-card/stripe-connect.png)
‌
Once your application is completed, Stripe will redirect you back to the Unlock Dashboard. It may take a few days for Stripe to approve your application. Until then your lock won't be able to receive card payments.

![stripe connected](/images/blog/unlock-credit-card/stripe-connected.png)
‌

## Allow Key Granting

‌
While you are waiting for Stripe's final approval, you can perform the last step: giving Unlock Inc. the ability to grant keys to users whose credit card payment has been successfully processed. Once Unlock Inc. has charged your member's card, we will then send them the NFT so that they can use it to prove their membership. In order to do this, we need a lock manager to grant us the permission to grant keys. This role can be revoked at any point (but this will disable credit card payments) and we do not receive any other permission or capability on your lock.

![card enabled](/images/blog/unlock-credit-card/card-enabled.png)
‌

# Credit card Purchase flow

If you use Unlock's paywall application, the credit card flow is directly integrated in the checkout experience. The following screenshots illustrate the user flow.

In this example, there is a single lock, whose price is 0.01Eth (or about $24.50 at time of writing). If they select Credit card, they need to complete this information. In order to allow them to re-identify themselves, this flow creates an account for them using their email and a password of their choice that they can use to login if they want to. Unlock Inc. does not store credit card numbers. Once their information was saved, they are prompted once last time to confirm the transaction.

<div style="display: flex; flex-wrap: wrap; justify-content: center;">
<p><img src="/images/blog/unlock-credit-card/checkout.png" alt="checkout" width="230" height="auto"></p>

<p><img src="/images/blog/unlock-credit-card/payment-method.png" alt="payment method" width="230" height="auto"></p>

<p><img src="/images/blog/unlock-credit-card/card-details.png" alt="card details" width="230" height="auto"></p>

<p><img src="/images/blog/unlock-credit-card/confirm-payment.png" alt="confirm card payment" width="230" height="auto"></p>

<p><img src="/images/blog/unlock-credit-card/confirmed.png" alt="confirmed" width="230" height="auto">&zwnj;</p>

</div>

After this, they are all set and their wallet has received the NFT from your lock.

## Frequently Asked Questions

#### What are the fees?

‌The fees are a combination of Stripe's fees (2.9% + $0.30) as well as Unlock's fees used to pay for the blockchain transaction costs.

#### How is fraud prevented?

When a key/NFT is purchased via credit card, Unlock Inc., as the granter, retains the key manager title ([see roles on a lock contract](https://docs.unlock-protocol.com/developers/smart-contracts/lock-api/access-control)). This role means that the NFT owner cannot sell or cancel their membership themselves directly. This mechanism prevents malevolent users from using stolen cards, as they would not be able to monetize the NFT by selling or cancelling it.
‌

#### How to handle chargebacks?

When a credit card transaction has been reversed, it is recommended that the lock managers cancel the existing user's membership as this user should not be able to benefit from their cancelled membership anymore.

## Try it out!

Eventually, more of the world will move to crypto, especially as wallets and self-sovereign identities will be required by more an more applications. But until then, we know that people still like to use FIAT, and this is a way to do that! We want to embrace the migration by making it easy for anyone to dip their toes and purchase their first NFTs with a credit card!

**What do you think?** Feel free [to tweet us](https://twitter.com/unlockProtocol) or [join our Discord](https://discord.com/invite/Ah6ZEJyTDp). See something missing or want to build an integration with unlock? [Join our grant program!](/blog/token-grant-program)
