---
title: Hello Optimistic Unlocking
subTitle: Creating a smoother, faster and a more secure online purchase experience
authorName: Sascha Mombartz
publishDate: April 12, 2019
description: Introducing Optimistic Unlocking, which overcomes the slow confirmation times and provides a better user experience for blockchain transactions.
image: /images/blog/hellooptimisticunlocking/hero.jpg
---
![Optimistic Unlocking in action.](/images/blog/hellooptimisticunlocking/hero.jpg)

At Unlock we’re all about making transactions on the web seamless and effortless. Blockchain transactions have lots of incredible features, from low cost to permissionless, but the strong suit of blockchain technology – its safety features around immutable data also means every transaction needs to be confirmed by miners. This can take time. Generally Ethereum transactions are considered final after they’ve been confirmed by 12 miners, which can take a few minutes and longer depending on how busy the network is. This presents 2 challenges: not only is this slow, but it is very hard to predict accurately.

The reason we do this is to ensure that funds aren’t double spent (accidentally or purposefully). Theoretically users could spend their Ether in one place and while that transaction is still being confirmed spend it in another place. In this instance the transaction that’s confirmed first would go through and the other would fail.

![Optimistic Unlocking in action.](/images/blog/hellooptimisticunlocking/locked.jpg)

One of our core beliefs is that the challenge most creators are facing is not so much fraud than it is friction. Increasing conversion rates will have a much larger impact on their revenue than fighting the rare cases of fraud. So instead of adding friction or delays to all of the benevolent users in order to stop a few fraudsters, we believe it’s much more beneficial to make it easier to unlock content, even if that means that a small number of people will find ways to “cheat” creators by a few dollars.

We want to trust people! And we’re optimistic that they actually want the content and are willing to pay for it fair and square. Meet Optimistic Unlocking!

We’re working on an algorithm that will determine if a transaction is likely to go through or not, based on the user's balance, their previous transactions, and a few other factors. If it’s likely to go through, the content immediately unlocks while it’s still being mined and confirmed  in the background. We display a status bar and notifications, and a confirmation once the transaction went through.

![Optimistic Unlocking in action.](/images/blog/hellooptimisticunlocking/confirming.jpg)

A confirmed purchase will soon show a new flag with the duration of your subscription and let you click through to your keychain where you can review your purchases.

![Optimistic Unlocking in action.](/images/blog/hellooptimisticunlocking/subscribed.jpg)

Should something unexpected happen – like the transaction is taking longer than usual to be confirmed, as would happen if funds were accidentally double spent, the content gets automatically locked again. The user is informed that there was an issue with the transaction and is led through the default purchase flow.

We could also detect new transactions sent by users with a pending transaction, and immediately re-lock the content because we then know that their key purchase is likely to not go through!

If the algorithm determined this is a transaction that is unlikely to be confirmed (hopefully a rare case), the user is presented with the default purchase flow where they have to wait for the transaction to be confirmed by 12 miners. Not the worst of scenarios - it just requires a bit of patience.

![Optimistic Unlocking in action.](/images/blog/hellooptimisticunlocking/stages.jpg)

In a nutshell, Optimistic Unlocking makes the entire purchasing experience better by allowing instant unlocking while still maintaining a high degree of security. A much nicer user experience gives users more freedom and creators more conversion, all with minimal risk.

That’s Optimistic Unlocking – and one step towards our bigger goal of removing barriers in the purchasing flow. We hope you find this mechanism just as exciting and useful as we do and we’d love to hear from you – email us, or join the conversation on telegram.
