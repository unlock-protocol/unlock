---
title: Unlock's Delegated Provider
subTitle: Enabling richer provider interactions
authorName: Christopher Nascone
publishDate: April 29, 2020
description: The delegated provider allows the embedded paywall to synchronize with the provider used on the host page
image: /images/blog/delegated-provider/Web3Modal.jpg
---

The latest release of the Unlock Paywall includes a feature that allows the host page to share the provider it uses with the embedded iframe. Let's take a look at why that's important, and what this enables.

# Not All Dapp Browsers Behave The Same

This isn't the first code we've written to share the provider in use on the host page with the paywall. The very first iteration of this feature was a dirrect response to browser compatibility issues. Our paywall is itself a dapp that gets embedded in an iframe on a host page (which may or may not be a dapp). Some browsers, like Metamask on desktop, will inject a provider into the global environment of an iframe just like they do on any other page. However, some other browsers, like Trust Wallet on mobile devices, do not. For those users, our paywall would appear to be broken because it does not have full functionality without a provider.

Our earliest solution to this challenge was perhaps a bit more complicated than necessary, but it did resolve the problem. The latest iteration keeps this important functionality, but does so in a simpler, easier to maintain way.

# It's Not Enough to Have _Just Any_ Provider

As the Web3 ecosystem has matured, new options for providers have become available, and our app wasn't quite ready for them. We don't necessarily want to always use the provider at `window.ethereum`, because if the host site wants to implement Web3Modal or WalletConnect (which usually return a provider object but do not inject them into the global environment), the paywall won't have access to them without some extra manual work from the implementer.

To that end, the latest version of Unlock's delegated provider has fewer baked-in assumptions about how your app or site is constructed. It's more flexible, which makes it work in a broader set of environments. Stay tuned for a blog post coming soon to see how you can use some advanced paywall integration techniques to enable one of these provider solutions!
