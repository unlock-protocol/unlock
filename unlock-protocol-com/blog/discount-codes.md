---
title: Discount Codes
subTitle: Apply promo codes and coupons to your memberships
authorName: Julien Genestoux
publishDate: January 10, 2023
description: Whether you are organizing events, selling subscriptions to your content, or running a knitting club, sometimes, you want to provide discounts to your mosy loyal customers. You can do that with your lock smart contract.
image: /images/blog/promo-codes/coupon-code.png
---

![Coupon code](/images/blog/promo-codes/coupon-code.png)

We're starting this year like we finished the previous one: 🚀 by shipping cool features. Today, we're introducing a new type of [purchase hook](https://docs.unlock-protocol.com/core-protocol/public-lock/hooks): the **discount hook**! Whether you are organizing events, selling subscriptions to your content, or running a knitting club, sometimes, you want to provide discounts to your most loyal customers.

Since an example is worth a thousand words, here is one. Here is a membership [that costs 0.01 Goerli Eth](https://app.unlock-protocol.com/checkout?paywallConfig=%7B%22locks%22%3A%7B%220x2490f447fdb7b259bc454871806b6b794de65944%22%3A%7B%22network%22%3A5%2C%22skipRecipient%22%3Atrue%2C%22name%22%3A%22%22%2C%22captcha%22%3Afalse%2C%22password%22%3Afalse%2C%22promo%22%3Atrue%2C%22emailRequired%22%3Afalse%2C%22maxRecipients%22%3Anull%2C%22dataBuilder%22%3A%22%22%7D%7D%2C%22pessimistic%22%3Atrue%2C%22skipRecipient%22%3Atrue%7D). If you go through the whole checkout, you will find a new screen that lets you enter a promo code! Try `FRIENDS` for a 50% discount, or `FAMILY` for a 100% discount!

![enter coupon](/images/blog/promo-codes/promo-screen.jpeg)

Of course, this is "safe" and evesdropping on the transaction from a block explorer will not let someone _guess_ promo codes. Like always we published the [source code on Github](https://github.com/unlock-protocol/discount-hook) along with detailed explainations on how to set this up for your own lock contract.
