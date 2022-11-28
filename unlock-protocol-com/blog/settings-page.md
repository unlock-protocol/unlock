---
title: Unlock’s Lock settings page has a whole new look
subTitle: Easily customize all the details about your Lock
description: Unlock launches a new settings page for Locks focused on ease of use.
authorName: Kalidou Diagne
publishDate: November 28, 2022
image: /images/blog/settings-page/settings-page.png
---

Unlock is happy to unveil a completely redesigned settings page that offers an intuitive way to update details and parameters for Unlock membership smart contracts (”Locks”).

In the past, customizing some Lock attributes required Lock Managers to interact directly with the contract by functions via a [block explorer](https://unlock-protocol.com/guides/how-to-use-blockchain-explorers-with-unlock-protocol/). With this release, however, nearly every aspect of the smart contract can be managed from a greatly streamlined interface, reducing (and in most cases, eliminating) the need to interact via block explorers.

Let's look at what’s now available.

## Manage Lock Page

This page has been simplified and reorganized. Less-frequently-taken actions like `Change price` or `Change quantity` have been moved inside the Settings page. We have added a `Tools` dropdown to collect all the actions possible in one place in the interface. `Update Lock Settings` is one of the options on that menu.

![manage-lock-overview-min.png](/images/blog/settings-page/manage-lock-overview-min.png)

## Settings Page

Lock settings have been organized into 5 logical groups:

- Membership terms
- Payments
- Roles
- General
- Misc.

![settings-page-overview-min.png](/images/blog/settings-page/settings-page-overview-min.png)

## Membership terms

In this section, we can manage all the membership terms:

- Duration: Set up how long each membership lasts.
- Quantity: The maximum number of memberships that can be sold. Note: There is no limit to the number of memberships that can be airdropped by a lock manager or key granter.
- Transfer: Allow members to transfer membership from one to another.
- Cancellation: Select how your contract should handle cancellations and optionally issue refunds.

![membership-terms-min.png](/images/blog/settings-page/membership-terms-min.png)

## Payments

In this section, we can manage all the payment terms:

- Price: The price to the purchaser to create (mint) one membership NFT from the contract.
- Credit Card Payment: Options to configure acceptance of credit cards, Apple Pay and Google Pay. Service and credit card processing fees will be applied to the price paid by the member.
- Renewals: Offer a membership as a recurring subscription and automatically renew memberships when they expire.

![payments-min.png](/images/blog/settings-page/payments-min.png)

## Roles

In this section, we can manage roles for administering a Lock. In particular:

- Lock Manager: By default, the creator of a Lock is the first Lock Manager, granting them the highest level of permissions for the lock. You can also assign this role to other wallets. Be careful: this role can’t be revoked but only renounced.
- Verifiers: Verifiers are trusted users at a ticketed event who can use a smartphone camera to scan a ticket QR code at the check-in to a venue and mark a ticket as checked-in.

![roles-overview-min.png](/images/blog/settings-page/roles-overview-min.png)

## General

In this section, we can manage general Lock terms:

- Contract name: Customize the contract name on-chain.
- Ticker symbol: Default: KEY. You can customize your membership experience by changing the token symbol (sometimes called 'ticker').
  ![general-min.png](/images/blog/settings-page/general-min.png)

## Misc

In this section, we can update other membership terms:

- Referral fees: Set up a percentage of the membership price to be sent to the referrer. This is a great use case to reward your members to promote your membership.
- Hooks: Hooks are 3rd party contracts that can be called when your Lock itself is called. Hooks can be used for password-protected purchases and other use cases.
- Versioning: Easily upgrade the lock version.

![misc-open-min.png](/images/blog/settings-page/misc-min.png)

We are committed to continue to add easier and friendlier ways to deploy and manage every single part of your membership. If you have any suggestions, please tell us in Discord!

**What if I find an issue or bug?**

Please open an issue on Github or tell us in Discord and we'll fix it ASAP.
