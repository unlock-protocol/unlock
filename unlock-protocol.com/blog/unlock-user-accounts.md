---
title: Unlock User Accounts
subTitle: Providing an on-ramp for those who are new to crypto
authorName: Christopher Nascone
publishDate: September 15, 2019
description: Unlock Inc. provides a way for users without crypto wallets to buy keys to locks on the Unlock protocol.
image: /static/images/blog/unlock-user-accounts/user-accounts.jpg
---

![User accounts let you easily pay with crypto.](/static/images/blog/unlock-user-accounts/user-accounts.jpg)

The decentralized web is great, but we want it to be available for those who aren't early
adopters. Currently interacting with Dapps like Unlock requires the use of a Web3 wallet
(like MetaMask on desktop web browsers or the use of a browser with an integrated wallet
like Opera on mobile devices). At Unlock we want to provide an on-ramp for everyone, not
just those already interested in crypto. Thus, we are pleased to introduce Unlock User
Accounts, which allow people with no knowledge of crypto to use our services on selected
locks. Once they're ready, they can "eject" their accounts and import them into the wallet
of their choice.

## A Managed Crypto Wallet

We didn't want to create parallel ecosystems of "haves" and "have-nots" on our protocol,
so one of our key challenges was to host Web3 wallets for our users without compromising
their privacy or control of their keys. To that end, we store an encrypted wallet. We
never see the keys, all decryption and wallet interaction is done client-side, and their
transactions are carried out on the chain. When a user purchases a key, they pay with
their credit card, and our backend purchaser buys the key and transfers it to their
account seamlessly.

## Signing Up and Logging In

The signup process is quite simple. You can sign up from a supported checkout page, or on
our main site. After entering your email, you will receive a confirmation email from us
with a link to finish setting up the account with a password. After that, you can set up a
payment method through Stripe so that you can make key purchases!

## In The Longer Term

We're not fans of lock-in, so don't think that this is an attempt to get hooks into naive
users. When a user account is ready to "graduate," the account holder can eject the
account and take control of it themselves, retaining all their keys and transaction
history.

## Availability

We're enabling user accounts for our partners on select locks (reach out to
us!), keys for which are denominated in DAI. We charge a small fee to facilitate
the transaction, which is added to the price at checkout and clearly broken down
so people know what we're charging and why. The final price in dollars is
computed as the conversion of DAI to dollars, credit card fees, and our service
fee.

For example, consider a 10DAI lock. The fee structure will be approximately as follows:

| Fee | Amount Charged |
| :-- | -------------: |
| Base lock price | `$10.00` |
| Credit card processing fee | `$0.61` |
| Unlock service fee | `$0.50` |
| | Total: `$11.11` |
