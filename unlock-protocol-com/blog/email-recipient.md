---
title: Wallet-less airdrops!
subTitle: Unlock Launches Support For Email Recipients on Airdrops and Checkout
authorName: searchableguy
publishDate: January 27, 2023
description: We're excited to announce support for email recipients on airdrops and checkout
image: /images/blog/email-recipient/airdrop.gif
---

We're excited to announce support for email recipients on airdrops and checkout! With this new feature, you no longer need a wallet address to airdrop or buy NFTs for someone else. Instead, you can _just use their email address_ to airdrop or send them an NFT. (If they want, they can transfer the NFT to their own wallet later while still being able to verify their ownership of the NFT using the QR code attached to email.)

To use email address as the recipient, you need to turn on "no wallet address?" option.
![Airdrops](/images/blog/email-recipient/airdrop.gif)

With this new feature, we aim to make the process of sending airdrops and buying NFTs more accessible to everyone, regardless of their experience or knowledge of cryptocurrency.

![Checkout](/images/blog/email-recipient/checkout.png)

### How does it work?

We are excited to introduce our new KeyManager contract, a game-changing contract that powers our email recipient approach in airdrops and checkout.

When a users enters a recipient’s email, we create a uniue wallet address without a private key from it and drop the NFT to it while setting the manager of NFT to the KeyManager contract address. This gives the KeyManager contract rights to transfer the NFT on request.

A signed proof, in the form of a QR code, is generated and sent to the recipient's email. Recipients can verify their ownership of the NFT at events using this QR code, without transferring the NFT to their own wallet. Additionally, they can also transfer the NFT to their own wallet at any time by following the instructions and link to the transfer page in the email.

Recipients need to go to the transfer page and request a transfer code to their email. After entering the transfer code, they can transfer the NFT to their own wallet. Transferring the NFT also transfer any associated data to the new owner.

![Transfer Page](/images/blog/email-recipient/transfer.png)

This new feature not only makes it easier for individuals who may not have been able to participate in airdrops before due to a lack of a wallet or technical know-how, but it also makes it easier for crypto-native users to quickly onboard their friends and family by buying a NFT to them.

At Unlock Protocol, we believe that this feature will greatly enhance the reach and accessibility of airdrops and we look forward to seeing the impact it has on the industry.
