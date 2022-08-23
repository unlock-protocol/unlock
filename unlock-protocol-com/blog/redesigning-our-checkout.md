---
title: Unlock Protocol's Brand New Checkout Experience
subTitle: Unlock launches a completely redesigned checkout experience
authorName: searchableguy
publishDate: August 25, 2022
description: Unlock launches a completely redesigned checkout experience.
image: /images/blog/redesigned-checkout/new-checkout.png
---

We've completely redesigned the Unlock checkout experience after a ton of user testing and feedback.

<video controls autoplay>
  <source src="/images/blog/redesigned-checkout/checkout-experience.mp4" type="video/mp4">
</video>

### Lock selection

Memberships will be grouped by networks and provide information about the network to users. This move is intended to educate users about the network and make it easier for creators to sell memberships on multiple networks with different benefits.

![lock selection on checkout](/images/blog/redesigned-checkout/new-checkout.png)

### Choosing quantity

You will be able to select the quantity and payment method you want to use earlier in the flow.

![quantity selection on checkout](/images/blog/redesigned-checkout/new-checkout-quantity.jpg)

### Recipient and metadata collection

The recipients field will be populated based on the quantity indicated in the prior step. You will be able to add recipient addresses and fill out metadata information for each recipient. We've added more validation checks to ensure a user cannot buy more memberships than allowed by the lock owner early in the flow.

![metadata and recipients on checkout](/images/blog/redesigned-checkout/new-checkout-metadata.png)

### Payment using credit cards

We've made it easier to pick and change credit cards using the checkout.

![card selection on checkout](/images/blog/redesigned-checkout/new-checkout-add-card.png)

### Confirmation

Our new confirmation page will show you how many memberships you are buying, what the total amount is, how many times a membership will be renewed if it's a recurring membership and more.

![confirmation on checkout](/images/blog/redesigned-checkout/new-checkout-confirmation.png)

### Minting

We have some cool minting animations to show off while your transactions are confirmed on the chain. In most cases, it will be instant but if not, you have something to look forward to.

![minting progress on checkout](/images/blog/redesigned-checkout/new-checkout-minting.png)

![minting finished on checkout](/images/blog/redesigned-checkout/new-checkout-finished.png)

### Using an Unlock Account

We've tried to make it easier for purchasers who are using credit cards or who are not crypto-savvy to use an [Unlock Account](https://docs.unlock-protocol.com/basics/new-to-unlock/unlock-accounts). Users can choose to login or checkout using Unlock Account with an email and password, similar to a traditional login experience, as an alternative to using a crypto wallet.

![signing using unlock account](/images/blog/redesigned-checkout/new-checkout-unlock-account.png)

## Sign in with Ethereum

Similar to checkout, we've updated our Sign in with Ethereum integration to match our new design.

<video controls autoplay>
  <source src="/images/blog/redesigned-checkout/sign-in-with-ethereum.mp4" type="video/mp4">
</video>

## Paywall config

We've not made any breaking changes as part of the redesign effort. However, we have introduced new fields for customizing descriptions on new screens and titles shown on the checkout flow.

You can find more about them inside the [paywall configuration documentation](https://docs.unlock-protocol.com/tools/paywall/configuring-checkout).

## Unlock's new checkout experience is backward-compatible

In addition, we have introduced a new path - `/legacy/checkout` - for sites, creators and developers who would like to stay on the existing checkout experience at the current time. Please note that this path will not be maintained going forward, so to always make sure you're using the latest and greatest checkout experience, please do make plans to migrate to the primary checkout experience in the near future.
