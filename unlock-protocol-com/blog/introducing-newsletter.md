---
title: Newsletters
subTitle: Newsletters are memberships! Easily start collecting members with their email addresses using Unlock
authorName: Julien Genestoux
publishDate: December 12, 2019
description: Unlock lets you easily collect email addresses from members to create your own paid-for mailing list, using Ethereum and Non Fungible Tokens
image: /images/blog/introducing-newsletter/newsletter.jpg
---

There are many kinds of memberships. Going back to the origins of the internet, newsletters have always been a popular style of membership. Today, we're excited to show you how you can easily use a lock to create your own newsletter membership with Unlock!

# The Defiant

A couple of weeks ago, while at DevCon in Osaka, I was introduced to [Camila](https://twitter.com/camirusso) who publishes one of the most insightful newsletters about the DeFi movement. When I told her about Unlock and the fact that we [tokenize memberships](/blog/tokenizing-memberships/), we quickly agreed that she needed to provide the ability to join her mailing list using crypto.

Today, that's possible! You can [become a member of The Defiant](https://bit.ly/the-defiant) using DAI. If you join quickly, you can become an [OG member](https://etherscan.io/address/0xFA7001A0310B5E69B7b95B72aeBaA66C72E084bf) (limited to 100 members) for 70 DAI. If you miss the OG perk, you can still join her [regular membership](https://etherscan.io/address/0x43154efc9cb33c80833c0dec1e15bb9cfc1275e5) for the next year, at 100 DAI!

Of course, like any other key, The Defiant membership keys are Non Fungible Tokens and your favorite crypto wallet should show them. For example, here's my [OG membership on OpenSea](https://opensea.io/assets/0xFA7001A0310B5E69B7b95B72aeBaA66C72E084bf/1).

# How It Works

First, the creator deploys their own lock on the Ethereum chain. Once you are on the newsletter landing page, you can enter your email address. As you submit, the address is saved inside the metadata of your token.

After this, you can select which of the memberships (if there is more than one) you want to join. Your crypto wallet of choice will let you perform the transaction, including approving the ERC20 token transfer.

After this, the access key will be attached to your account, and you can use Unlock's keychain to view it.

One of the unique characteristics of our approach is that, exactly like [tickets to conferences](/blog/ethcc-tickets/), the email address is in fact stored in the tokens' metadata. This means that the owner of the lock can easily list all of the members email addresses!

# Get your own!

Want to send emails to your own members? Start by creating your own lock. It's a representation of a membership. Pick a currency, a price, a maximum number of members... and deploy it!

Then, things become a little bit more technical, but here is how to collect email addresses from your members:

1. Start with `https://newsletter.unlock-protocol.com/`

2. Add a title by appending `?title=Your Title`

3. Then, add a description like `&description=My Newsletter`

4. Finally, add one or more locks like these: `&locks=<lock-address>`

After this, you can share the URL with anyone who you think should become a member!

Later, once you want to email your users, just click on the `Members` icon on the lock in your dashboard. Once on that page, authenticate using your crypto wallet and you will see a list of members, along with their email addresses.

![Newsletter Members](/images/blog/introducing-newsletter/defiant-members.png)

As you can see the members page includes an export button which lets you download a CSV file. This file can then be imported in your email sending tool of choice!
