---
title: Unlock Protocol's Brand New Checkout Experience
subTitle: Unlock launches a completely redesigned checkout experience
authorName: searchableguy
publishDate: August 25, 2022
description: Unlock launches a completely redesigned checkout experience.
image: /images/blog/redesigned-checkout/checkout.gif
---

Currently, one of the most notable opportunities in web3 is to [improve and simplify the user experience](https://builtin.com/design-ux/web3-design). With that goal in mind, Unlock has completely redesigned the Unlock checkout experience based on extensive user testing and feedback.

Here is what the new Unlock checkout experience looks like.

![Checkout](/images/blog/redesigned-checkout/checkout.gif)

Let's go into the details, step-by-step.

### Lock selection

Memberships are now grouped by network and provide information about the networks to users. This educates users about the network and makes it easier for creators to sell memberships on multiple networks with different benefits.

![lock selection on checkout](/images/blog/redesigned-checkout/checkout.png)

### Quantity selection

Purchasers can choose to purchase multiple memberships. If creator has enabled `maxRecipients` or `minRecipients` in the paywall config, we will prompt user to select quantity. By default, we skip the quantity selection since most users only want to buy or unlock content for themselves.

![quantity selection on checkout](/images/blog/redesigned-checkout/checkout-quantity.png)

### Recipient and metadata collection

The recipient field is now populated based on the quantity indicated in the prior step. Purchasers can add recipient addresses and fill out metadata information for each recipient. Addtionally, we've added additional validation checks to ensure a user cannot buy more memberships than allowed by the lock owner.

![metadata and recipients on checkout](/images/blog/redesigned-checkout/checkout-recipients.png)

### Payment using credit cards and other payment types

We've made it easier to choose from multiple payment options.

![payment selection on checkout](/images/blog/redesigned-checkout/checkout-payment.png)

Similarly, we've made it easier to pick and change credit cards using the checkout.

![card selection on checkout](/images/blog/redesigned-checkout/checkout-card.png)

We've added the support for Superfluid and claim which allow creators to drop claimable memberships to users for free. We will automatically show users different payment options based on what creators enabled on the checkout.

### Confirmation

Our new confirmation page shows the purchaser how many memberships they are buying, what the total amount is, and how many times a membership will be renewed if it's a [recurring membership](https://unlock-protocol.com/blog/recurring-subscription-nft). Trust and communication are key elements of user experience, and we want to reduce the chance of surprises at checkout time.

![confirmation on checkout](/images/blog/redesigned-checkout/checkout-confirm.png)

### Minting

We have some cool minting animations to show off while transactions are confirmed on the chain. In most cases, minting will be instant but if not, there is something to look forward to.

![Minting finished](/images/blog/redesigned-checkout/checkout-finished.png)

### Using an Unlock Account

We've tried to make it easier for purchasers who are using credit cards or who are not crypto-savvy to use an [Unlock Account](https://docs.unlock-protocol.com/basics/new-to-unlock/unlock-accounts). Users can choose to login or checkout using an Unlock Account with an email and password, similar to a traditional login experience as an alternative to using a crypto wallet.

![signing using unlock account](/images/blog/redesigned-checkout/unlock-account.gif)

## Sign in with Ethereum

We've updated our Sign in with Ethereum integration to match our new design.

![Sign in with ethereum](/images/blog/redesigned-checkout/sign-in-with-ethereum.gif)

## Paywall configuration

We've not made any breaking changes as part of the redesign effort. However, we now ignore most of the call action fields which were used to display different texts on the checkout. After listening to user feedback, we realized it was often not helpful and confused them due to the amount of information conveyed.

We might bring some of these back in different shape if there is demand but for now, they will be ignored.

You can find more about them inside the [paywall configuration documentation](https://docs.unlock-protocol.com/tools/paywall/configuring-checkout).

## Unlock's new checkout experience is backward-compatible

In addition, we have introduced a new path — `/legacy/checkout` — for sites, creators and developers who would like to stay on the existing checkout experience at the current time. Please note that this `legacy` path will not be maintained going forward, so to ensure you're using the latest and greatest checkout experience, please do make plans to migrate to the primary checkout experience in the near future if you have any projects using this legacy checkout experience path. We will deprecate it by the end of the year and remove it.

If you are using our paywall script in your apps, append `?legacy=true` to the paywall URL you are loading to use the legacy checkout.

## What if I find an issue or bug in the new checkout?

Please open an issue on Github or tell us in the Discord and we'll fix it ASAP.
