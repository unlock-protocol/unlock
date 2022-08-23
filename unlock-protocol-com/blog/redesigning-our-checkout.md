---
title: Unlock Protocol's Brand New Checkout Experience
subTitle: We are launching a public preview of the new Unlock checkout experience.
authorName: searchableguy
publishDate: August 25, 2022
description: We are launching a public preview of the new Unlock checkout experience.
image: /images/blog/redesigned-checkout/new-checkout.png
---

## Checkout experience

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

We've made it easier to pick and change credit cards using the checkout. We're planning to introduce more traditional payment options soon.

![card selection on checkout](/images/blog/redesigned-checkout/new-checkout-add-card.png)

### Confirmation

Our new confirmation page will show you how many memberships you are buying, what the total amount is, how many times a membership will be renewed if it's a recurring membership and more.

![confirmation on checkout](/images/blog/redesigned-checkout/new-checkout-confirmation.png)

### Minting

We have some cool minting animations to show off while your transactions are confirmed on the chain. In most cases, it will be instant but if not, you have something to look forward to.

![minting progress on checkout](/images/blog/redesigned-checkout/new-checkout-minting.png)

![minting finished on checkout](/images/blog/redesigned-checkout/new-checkout-finished.png)

### Using an Unlock account

We've tried to make it easier to use an Unlock account and explain who is it intended for. Users can choose to login using their crypto wallet or checkout using Unlock account in which case they would only be able to buy credit card enabled memberships.

![signing using unlock account](/images/blog/redesigned-checkout/new-checkout-unlock-account.png)

## Sign in with Ethereum

Similar to checkout, we've updated our Sign in with Ethereum integration to match our new design.

<video controls autoplay>
  <source src="/images/blog/redesigned-checkout/sign-in-with-ethereum.mp4" type="video/mp4">
</video>

## Paywall config

We've not made any breaking changes as part of the redesign effort. However, we have introduced new fields for customizing descriptions on new screens and titles shown on the checkout flow.

You can find more about them inside the [paywall configuration documentation](https://docs.unlock-protocol.com/tools/paywall/configuring-checkout).

## We are listening

We will keep the redesigned checkout experience on a brand new path - `/alpha/checkout` for a month. During this period, we will iron out any bugs, iterate upon user feedback and feature requests and make sure no integration built on top of Unlock Protocol breaks.

If you want to be a tester and provide feedback, all you need to do is prefix your checkout or Sign in with Ethereum URL with `/alpha`.

```
// from
https://app.unlock-protocol.com/checkout?client_id=www.ouvre-boite.com&redirect_uri=https%3A%2F%2Fwww.ouvre-boite.com%2F

// to
https://app.unlock-protocol.com/alpha/checkout?client_id=www.ouvre-boite.com&redirect_uri=https%3A%2F%2Fwww.ouvre-boite.com%2F
```
