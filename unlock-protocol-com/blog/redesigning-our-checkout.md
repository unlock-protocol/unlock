---
title: Unlock Protocol's Brand New Checkout Experience
subTitle: Unlock launches a completely redesigned checkout experience
authorName: searchableguy
publishDate: August 25, 2022
description: Unlock launches a completely redesigned checkout experience.
image: /images/blog/redesigned-checkout/new-unlock-checkout-animation.gif
---

Currently, one of the most notable opportunities in web3 is to [improve and simplify the user experience](https://builtin.com/design-ux/web3-design). With that goal in mind, Unlock has completely redesigned the Unlock checkout experience based on extensive user testing and feedback.

Here is what the new Unlock checkout experience looks like.

<video controls autoplay>
  <source src="/images/blog/redesigned-checkout/checkout-experience.mp4" type="video/mp4">
</video>

Let's go into the details, step-by-step.

### Lock selection

Memberships are now grouped by networks and provide information about the network to users. This educates users about the network and makes it easier for creators to sell memberships on multiple networks with different benefits.

![lock selection on checkout](/images/blog/redesigned-checkout/new-checkout.png)

### Quantity selection

Purchasers can now select the quantity and payment method to use earlier in the checkout flow.

![quantity selection on checkout](/images/blog/redesigned-checkout/new-checkout-quantity.jpg)

### Recipient and metadata collection

The recipient field is now populated based on the quantity indicated in the prior step. Purchasers can add recipient addresses and fill out metadata information for each recipient. Addtionally, we've added additional validation checks to ensure a user cannot buy more memberships than allowed by the lock owner.

![metadata and recipients on checkout](/images/blog/redesigned-checkout/new-checkout-metadata.png)

### Payment using credit cards and other payment types

We've made it easier to pick and change credit cards using the checkout.

![card selection on checkout](/images/blog/redesigned-checkout/new-checkout-add-card.png)

We have also added the support for Superfluid and for claiming memberships. If any of those payment methods are enabled for your checkout, they will automatically show up as options to users.

### Confirmation

Our new confirmation page shows the purchaser how many memberships they are buying, what the total amount is, and how many times a membership will be renewed if it's a [recurring membership](https://unlock-protocol.com/blog/recurring-subscription-nft). Trust and communication are key elements of user experience, and we want to reduce the chance of surprises at checkout time.

![confirmation on checkout](/images/blog/redesigned-checkout/new-checkout-confirmation.png)

### Minting

We have some cool minting animations to show off while transactions are confirmed on the chain. In most cases, minting will be instant but if not, there is something to look forward to.

![minting progress on checkout](/images/blog/redesigned-checkout/new-checkout-minting.png)

![minting finished on checkout](/images/blog/redesigned-checkout/new-checkout-finished.png)

### Using an Unlock Account

We've tried to make it easier for purchasers who are using credit cards or who are not crypto-savvy to use an [Unlock Account](https://docs.unlock-protocol.com/basics/new-to-unlock/unlock-accounts). Users can choose to login or checkout using an Unlock Account with an email and password, similar to a traditional login experience as an alternative to using a crypto wallet.

![signing using unlock account](/images/blog/redesigned-checkout/new-checkout-unlock-account.png)

## Sign in with Ethereum

Similar to checkout, we've updated our Sign in with Ethereum integration to match our new design.

<video controls autoplay>
  <source src="/images/blog/redesigned-checkout/sign-in-with-ethereum.mp4" type="video/mp4">
</video>

## Paywall configuration

We've not made any breaking changes as part of the redesign effort. However, we have introduced new fields for customizing descriptions on these new screens and to the titles shown on the checkout flow.

You can find more about them inside the [paywall configuration documentation](https://docs.unlock-protocol.com/tools/paywall/configuring-checkout).

## Unlock's new checkout experience is backward-compatible

In addition, we have introduced a new path — `/legacy/checkout` — for sites, creators and developers who would like to stay on the existing checkout experience at the current time. Please note that this `legacy` path will not be maintained going forward, so to ensure you're using the latest and greatest checkout experience, please do make plans to migrate to the primary checkout experience in the near future if you have any projects using this legacy checkout experience path.

If you are using our paywall script in your apps, append `?legacy=true` to the paywall URL you are loading. It will open the legacy checkout.

## What if I find an issue or bug in the new checkout?

Please open an issue on Github or tell us in the Discord and we'll fix it ASAP.
