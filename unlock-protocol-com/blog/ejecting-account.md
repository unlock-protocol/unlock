---
title: Ejecting an Unlock Account
subTitle: Graduating with grace!
authorName: Julien Genestoux
publishDate: Nov 5, 2019
description: Unlock accounts are regular Ethereum accounts. You can easily take it over and use it with your own web3 wallet!
image: /images/blog/ejecting-account/ejecting.jpg
---

![Eject Unlock Account](/images/blog/ejecting-account/ejecting.jpg)

A couple of weeks ago, we introduced the [Unlock User Accounts](/blog/unlock-user-accounts). These accounts behave exactly like any other web account, with an email and password. Yet, under the hood, they're actually powerful Ethereum wallets with a private key which can be used to send transactions, receive funds, or interact directly with any smart contract.

In the Ethereum world, an account is identified by a pair of cryptographic keys. The public key, also known as the user's address, is a way to **identify** someone, while the private key is used to **authenticate** that user. The cryptographic keys are "self-sovereign" which means that they do not require any 3rd party to be created, or to be used, unlike a regular account on a web applications, which requires this web application to exist. This is a very powerful mechanism which guarantees a permissionless usage.

Unfortunately, this comes with a set of disadvantages. First: these keys are nearly impossible to remember, or even read and type! Their permissionlessness aspect also means that if someone forgets (or loses) them, no-one can help them... and they may be locked out of their account forever. Since the web was not built with such a system at its core, our muscle memory is not built around these concepts, which means that they're intimidating and foreign, but also require the use of tools that we're not familiar with, such as crypto wallets or browser extensions.

Our user accounts are built as a convenience layer wrapped around Ethereum accounts. Users can create an account with just an email and password, like we're all used to, but they can also take over the internal Ethereum account when they're ready to level up. We call that process "ejecting"!

## How to eject your Unlock account

Head over to [your settings page](https://app.unlock-protocol.com/settings/). The relevant section is the last one. It's important to read the warnings as is a one way street: there is no going back. Once an account has been ejected, it's deleted from Unlock's servers and cannot be recovered anymore.

If you're ready, follow the instruction and download your private key. It's encrypted using your Unlock account password. If you kept that password secret, the file itself is fairly harmless, but don't lose it!

Next, you need to install a web3 wallet. The most popular is [MetaMask](https://metamask.io/) and it works on Firefox or Chrome as well as on mobile devices. We'll take this one as an example, but you could also use [MyCrypto](https://mycrypto.com/) or several other ones.

Once you've installed MetaMask, choose a password to secure the extension. After this, click on the circle which represents your address. In the menu, select _Import Account_. Select the JSON file, and type your Unlock account's password. Submit the form and you'll be done!

![Metamask Menu](/images/blog/ejecting-account/import.jpg)

At Unlock, we deeply believe that each web user should _own and manage_ their account in a decentralized way. We understand that this is a significant change from what we've been used to on the web, which is why we're providing user accounts, however, our hope is that every Unlock user eventually ejects!
