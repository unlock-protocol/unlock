---
title: Sign-In with Ethereum
subTitle: The easiest way to let your users connect to your applications!
authorName: Julien Genestoux
publishDate: Feb 4 2022
description: Sign-In with Ethereum is a new form of authentication that enables users to control their digital identity through their crypto-wallets.
image: /images/blog/sign-in-ethereum/sign-in-ethereum.gif
---

We believe **everyone's online identity should not be tied to a platform**. Users must be able to authenticate using an identity that they fully own and control.

There are two ways to think about physical wallets: as an object that stores bills and coins but also as an object where identity cards, driving licenses and membership cards live. In the web3 space, we focus too much on the wallet as _cash holder_ and not enough on the wallet as _identity holder_, even though, in pratice, the private keys that power them are what enables the cash transfers through transaction signing.

Until now, it was often quite complicated for applications (both web and native) to prompt the user for their wallet address, in order to identify them. As there exists many types of wallets (browser extensions, mobile applications, or even fully "hosted" web apps), it means that asking the user to connect their wallet requires the implementation of multiple API and approaches. Dealing with "injected" objects in the DOM is not trivial and limited to web applications...

Today, we're announcing our own implementation of the [Sign-In With Ethereum](https://docs.unlock-protocol.com/unlock/developers/sign-in-with-ethereum) ([EIP4361](https://eips.ethereum.org/EIPS/eip-4361)) specification!

![sign-in-ethereum](/images/blog/sign-in-ethereum/sign-in-ethereum.gif)

This is the flow that we implemented in our WordPress plugin and that's already used on websites like [Bakery](https://bakery.fyi/), [The Zedge](https://thezedge.com/all-breeds/) and many others!

We also wanted this flow to be similar to the frequent **OAuth** & **OpenId Connect** flows, so that other applications who only need to _know_ of the user's address do not have to worry about handling web3 providers, will still being able to identity users. For this, we make it trivial for applications to build "authentication" URLs with a **redirect scheme** that allows even native application to easily identify the user's address.

Once the user has signed the message, they are optionally redirected back to the application and the redirect URL includes an additional `code` query string that can be decoded and parsed in order to retrieve all the user's info.

Our implementation also includes handling for users who do not have their own crypto wallet installed already, through our [Unlock accounts](https://docs.unlock-protocol.com/unlock/creators/unlock-accounts), which means that it's an easy way to let all users authenticate against your application!

Authentication is one of the core steps for any application that wants to [token-gate](https://docs.unlock-protocol.com/unlock/developers/building-token-gated-applications) content or features. Unlock's implementation of Sign in with Ethereum works all across web3, and works for:

- Web applications
- Native applications
- All types of wallets
- Through [WalletConnect](https://walletconnect.com/)
- And even for users without a wallet

Unlock makes it trivial for all apps to monetize with their own membership!
