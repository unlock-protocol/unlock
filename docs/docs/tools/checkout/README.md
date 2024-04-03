---
title: Checkout
description: >-
  Explainer on the what the checkout endpoint is which exists as part of
  the Unlock Protocol app.
---

# Checkout

The Unlock Labs team built an application, on top of the Open Protocol: most people are familiar with the Dashboard, Members and Keychain portions, but that app has an endpoint called **Checkout** which accepts a configuration object as params and yields a custom configured checkout experience.

The checkout can be used in a few different ways:

1. Stand-alone as a link you distribute to your members via email, Discord, etc.
   for minting your membership/ticket/credential NFT,
1. Embedded in your website directly,
1. In combination with the [Paywall javascript library](../paywall.md).

## Examples

There are two places you can experience what that looks like without
having to write any code or configure your own URL.

We use it on our [Discord](https://discord.unlock-protocol.com/)
so people can get an Unlock Membership and get members-only access in our Discord
server. Click on the "Unlock Discord" button in the lobby channel and that will
take you through the checkout process.

<p>
  <img alt="Unlock Discord button" width="225" src="/img/tools/checkout/unlock-discord-button.png"/>
</p>

From the Unlock [Dashboard](https://app.unlock-protocol.com/dashboard).
After you [deploy your first "Lock"](https://unlock-protocol.com/guides/how-to-create-a-lock/) and
the transaction has been confirmed. You can click on the lock in the list to pull
up the lock details page and then you can click on the "Tools" menu in the top
right corner and "Preview" to view it in action. That will pull up an example webpage with the checkout embedded based on the default
configuration and using the information from your lock.

![unlock dashboard demo menu item](/img/tools/checkout/unlock-dashboard-demo-menu.png)

You can play with configurations and see visually what your checkout will look
like by choosing "Create Checkout URL" from the menu options instead.

![unlock dashboard create checkout menu item](/img/tools/checkout/unlock-dashboard-create-checkout-menu.png)

This will take you to the "Checkout Builder" where you can build your checkout and
see what your changes look like in realtime.

If you'd like to use that configuration
with your [Paywall](../paywall), download the configuration file by clicking on the "Download JSON" button.

![unlock dashboard checkout builder](/img/tools/checkout/dashboard-checkout-builder.png)
