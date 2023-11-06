---
title: Token-gated Application Architecture
sidebar_position: 2
description: Overview of what a token gated web3 application architecture might look like.
---

# Token-gated Application Architecture

This guide provides a high-level overview of the steps involved in building a typical **web3** application flow with **token-gating**. This flow is not specific to Unlock and could actually be applied to other NFT (ERC721) or even currency contracts (ERC20). It can also be changed and customized to fit your application's needs.

One way to think of token gating is that it is "permission-less" _in-app purchases_. Your application does not need the approval of an App Store to sell access to custom features or content.

> Note: the flow described here is one used in many Unlock integrations, such as the [Unlock Protocol WordPress plugin](https://wordpress.org/plugins/unlock-protocol/). 

## Pre-requisites

Before building your application, you will need to identify what tokens will be used for the gating. Tokens usually live on blockchains (or similarly distributed ledgers). The vast majority of distributed and web3 apps (including the Unlock Protocol) are currently deployed in the Ethereum ecosystem (powered by Ethereum Virtual Machine - EVM) and we will focus this guide on that one.

The openness of the blockchain means you can select any token, whether you "control" them or whether they have been deployed by another person, company. If you decide to use a 3rd party contract, it is important that you verify if that contract's logic could be changed or upgraded outside of your control, which could possibly break your application.

Another important factor is to consider that by using your contract, you could actually use token-gating as a monetization mechanism. With Unlock you are in full control of the contract (as a deployer you are the sole lock manager by default) and you can select all of its terms (price, number of tokens, transfer and cancellation fees, etc...).

Additionally, Unlock provides you with a recurring revenue mechanism: each NFT membership has an expiration date (even though you could select an _infinite_ duration too), which means that your members will have to top-up their memberships if they want to keep receiving the benefits of your application.

Once you have deployed your lock, or if you identified a 3rd party contract you want to use, please keep track of its address. We will use this in the next steps.

### Authenticating the user

In the blockchain space, users are identified through their addresses. Whether your application has its own user accounts or not, it will need to prompt users for their own wallet address. You can think of it as a flow that's very similar to "Login with Google" (or other tech company that offers similar authentication features). There exist multiple libraries and applications to do that. Unlock offers its own "Sign with Wallet" flow. It is based on the [Sign In with Ethereum specification](https://login.xyz) but does not require your application to handle or process JavaScript. It also supports all popular wallets, as well as Unlock Accounts.

To be secure the process requires the user to sign a message (the message itself includes the user's address, a timestamp, and a nonce to prevent replay attacks), and your application will need to "recover" the user's address, based on the signed-message and the message itself.

Once identified, your application should consider with a high level of trust that the current visitor is indeed the "owner" of the private key used to authenticate. If your application has its own user account records, now is a good time to "map" the user's wallet address to their record (or maybe even create the record).

### Checking the contract

Once the user's address is known, the next logical step is to, check if it "owns" one of the tokens. To do that, your application needs to query the blockchain directly, or thru a "trusted" provider (it is important to make sure that this provider can easily be swapped for another to ensure true decentralization and redundancy). The providers are often called RPC providers because in practice they are blockchain nodes that expose an RPC endpoint used to retrieve data from the blockchain's state.

The actual method called depends on the type of contract. For ERC20 (currency-like tokens), but also ERC721 (NFT), the function `balanceOf` can be used. Unlock's locks also include a `balanceOf` function that will return `0` if the user does not have a valid membership or if it has expired, and a number larger than `1` otherwise.

Using Unlock your application could also use the `keyExpirationTimestampFor` to get the actual expiration of the user's membership... etc.

These RPC calls are cache-able but your application should expect the values to change if the user can transfer their tokens, for example.

### Enabling purchase

Optionally, when the user does not have the proper tokens required by your application, it might be desirable to provide them with the option to purchase or earn the token.

The challenge here is that each token will be different. For ERC20 (currencies) your application would need to offer the ability to "swap" tokens. To do that, it would need to list all of the available tokens that the user owns, as well as all of their relative prices... etc. This can prove fairly complicated. Similarly, for ERC721, the user might have to "mint" a new token, or purchase one on a secondary market... etc. In both cases, a simpler approach for your application might be to point users to a 3rd party application where the users can achieve that.

Unlock is not different from the cases above. If you want to enable users to purchase their NFT membership _directly_ in your application will need to retrieve a lot of information from the contract (the price, the currency, the duration as it may be useful to show it to users, whether the contract is sold out... etc). For that reason, Unlock provides easy-to-use "purchase urls" that your application can build to let the user check out easily. These URLs also implement by default our credit card flow and other mechanisms (such as the ability to require the user to submit information) and can easily be customized. Finally, these URLs can be configured to redirect the user back into your application, once the purchase has been successful, in order to simplify the user's experience.

### Conclusion

It is important to remind that everything described above can be customized, changed, or removed. As a protocol, Unlock provides a framework for memberships. For example, we believe that memberships can be earned in many applications, rather than bought.&#x20;

The open nature of the blockchain, and of Unlock also means that multiple applications can re-use the same lock, where users might be prompted to purchase their memberships on some, but only asked to connect their wallets on others.
