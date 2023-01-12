---
title: Websub
subTitle: Enabling subscriptions to new locks and new keys!
authorName: Julien Genestoux
publishDate: Feb 28, 2022
description: WebSub is a W3C protocol that provides a common mechanism for communication between publishers of any kind of Web content and their subscribers, based on HTTP web hooks.
image: /images/blog/websub.png
---

As developers integrate the Unlock Protocol in their applications, we are getting many feature requests to add APIs and tools that would make their lives easier.

![Websub](/images/blog/websub.png)

Today, we're excited to announce our [WebSub endpoints](https://docs.unlock-protocol.com/unlock/developers/locksmith/webhooks)!

WebSub is a [W3C protocol](https://www.w3.org/TR/websub/) that provides a common mechanism for communication between publishers of any kind of Web content and their subscribers, based on HTTP **web hooks**.

This is a very powerful mechanism to enable Publish/Subscribe on any kind of HTTP resource! We added this as a way for applications to subscribe to changes in the Unlock: applications can get notified when new locks are deployed or when new keys are created.

Our team used this new API in order to [create a Discord bot](https://github.com/unlock-protocol/websub-discord) that notifies us when a new lock has been deployed or when a new key has been purchased.

We'd love to see how your application ends up using that new capabilities!
