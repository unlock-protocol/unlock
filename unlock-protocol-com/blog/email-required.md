---
title: New feature! Easy Email Collection for Creators
subTitle: Now there's a way to keep in touch with your members!
authorName: Julien Genestoux
publishDate: October 18, 2022
description: Lock managers can configure the Unlock's checkout UI to collect their member's email addresses.
image: /images/blog/email-required/email-required-share.png
---

It was **1971** when Ray Tomlinson invented and developed electronic mail, as we know it today, by creating ARPANET's networked email system. It is one of the Internet’s oldest and (still!) most widely-used applications, with four [billion daily emails](https://blog.hubspot.com/marketing/email-marketing-stats)! Email predates the web, and predates the blockchain era. Over the years, it has seen many competing platforms come and go, but, for better or worse, email has remained the most frequently-used communication tool because it relies on open and decentralized protocols like [POP](https://en.wikipedia.org/wiki/Post_Office_Protocol), [SMTP](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol) and [IMAP](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol).

![Email required](/images/blog/email-required/email-required-share.png)

As of now, web3 still does not have a widely-used alternative messaging protocol, which means that email is the best option for creators to reach to their members and communities.

At Unlock, when using our [checkout flow](https://docs.unlock-protocol.com/tools/checkout/) (which is [completely optional](https://docs.unlock-protocol.com/getting-started/unlock-without-frontend)), creators can choose to require purchasers to enter their email addresses at purchase (mint) time. This has been possible for a long time through the use of our [“metadata” collection mechanism](https://docs.unlock-protocol.com/tools/checkout/collecting-metadata), and we now have simplified this experience for creators by making email address collection an option when building a checkout URL by using `emailRequired` in the lock options.

![Email required](/images/blog/email-required/collecting-email.png)

You can test it out if by getting the free Unlock community memberships, if you don't already have it! [Click here](https://app.unlock-protocol.com/checkout?redirectUri=https%3A%2F%2Funlock-protocol.com%2Fblog%2Femail-required&paywallConfig=%7B%22network%22%3A1%2C%22pessimistic%22%3Atrue%2C%22locks%22%3A%7B%220xCE62D71c768aeD7EA034c72a1bc4CF58830D9894%22%3A%7B%22name%22%3A%22Unlock%20Community%22%2C%22network%22%3A100%2C%22emailRequired%22%3Atrue%7D%7D%2C%22icon%22%3A%22https%3A%2F%2Fraw.githubusercontent.com%2Funlock-protocol%2Funlock%2Fmaster%2Fdesign%2Fbrand%2F1808-Unlock-Identity_Unlock-WordMark.svg%22%2C%22callToAction%22%3A%7B%22default%22%3A%22Get%20an%20Unlock%20membership%20to%20access%20our%20Discord%2C%20blog%20comments%20and%20more!%20No%20xDAI%20to%20pay%20for%20gas%3F%20Click%20the%20Claim%20button.%22%7D%7D)!

Once collected, the email address is tied to the NFT owner address, and is only accessible by the lock manager through the Unlock Dashboard or through our Locksmith API.

One of the common questions that creators have in the web3 space is “how do I stay connected and engaged with my members and NFT-holders?” We know that this new feature can help!

**Implementation note:** Of course, since the email address is tied to the NFT owner’s wallet address, if the NFT is transferred, the email address is not accessible anymore.
