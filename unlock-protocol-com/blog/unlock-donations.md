---
title: Unlock Donations
subTitle: Easily add a sponsorship button to your Github repository, using Unlock!
authorName: Julien Genestoux
publishDate: August 26, 2019
description: "A sponsor or a donor is a member of a unique club; the club of people and organizations which help someone do their work \"for free\" for the rest of the world. Unlock can easily be used to create sponsorships!"
image: /images/blog/unlock-donations/supporting-member.jpg
---

Today, we're excited to unveil our work on donations. In the last few years, it has become clear that the tech industry needs to have a deep reflection about Open Source: who works on it, how they are being paid, who supports them... Companies like [OpenCollective](https://opencollective.com/) have laid the groundwork by providing tools for open source developers to raise funds and organize their work. Earlier this year, Github [introduced sponsorship support](https://github.blog/2019-05-23-announcing-github-sponsors-a-new-way-to-contribute-to-open-source/) for repositories; letting maintainers show options to support them.

![sponsor unlock](/images/blog/unlock-donations/sponsor-unlock.png)
*Become a member to Unlock from Github, and Unlock comments in this blog!*

As you may know, Unlock is a **protocol for memberships**. A sponsor is a member of a unique club: the club of people which help someone do their work "for free" for the rest of the world. Today, with a [simple tool](https://donate.unlock-protocol.com/about.html), creators can easily use their locks to raise funds for their work and create their own membership.

# More than money

Of course, supporting Open Source works _starts_ with financial support, but it does not stop there. With Unlock, members receive their very own Non Fungible Token (a key!) which publicly shows their support (and reminds them of it in their own crypto wallets!). You can find the list of keys I own on [this OpenSea page](https://opensea.io/accounts/0xe5cd62ac8d2ca2a62a04958f07dd239c1ffe1a9e).

One of the benefits of using Ethereum here rather than a private database is that these tokens can be utilized in additional context, such as being displayed anywhere like [our blue checkmark](https://unlock-protocol.com/blog/blue-checkmark-nft/)!

Like any non fungible tokens, a supporter may also change their mind, and could either burn their token or transfer it to someone else.

Additionally, the membership itself can be reutilized to eventually grant access to additional features. As Taylor from MyCrypto puts it in their [Unlock donation page](https://donate.unlock-protocol.com/?thank-you=VGhhbmsgeW91IGZvciBjaG9vc2luZyB0byBiZSBhIE15Q3J5cHRvIHN1cHBvcnRlciEg4p2k77iPCgpBdCB0aGlzIHRpbWUsIHlvdXIgc3VwcG9ydCBpcyBhIHNpbXBsZSBkb25hdGlvbiB0aGF0IGhlbHBzIHVzIGNvbnRpbnVlIHdvcmtpbmcgdG8gYnJpbmcgeW91IHByb2R1Y3RzLgoKSW4gdGhlIGZ1dHVyZSB3ZSdsbCBiZSBmdXJ0aGVyIGRldmVsb3BpbmcgdGhpcyBmdW5jdGlvbmFsaXR5IHdpdGggdGhlIFVubG9jayBQcm90b2NvbCB0ZWFtIHRvIHJld2FyZCBzdXBwb3J0ZXJzIHdpdGggdGhpbmdzIGxpa2UgY3VzdG9tIHRoZW1lcywgc3dhZywgYW5kIG1vcmUuCgotVGF5bG9yICYgVGVhbSBNeUNyeXB0bw==&config=eyJwZXJzaXN0ZW50Q2hlY2tvdXQiOnRydWUsImljb24iOiJodHRwczovL2Fzc2V0cy51bmxvY2stcHJvdG9jb2wuY29tL3RtcC9teS1jcnlwdG8ucG5nIiwiY2FsbFRvQWN0aW9uIjp7ImRlZmF1bHQiOiJTdXBwb3J0IHRoZSBNeUNyeXB0byB0ZWFtIGFuZCB1bmxvY2sgeW91ciBtZW1iZXJzaGlwIHRvZGF5IVxuXG5Zb3UgY2FuIG1ha2UgYSBkb25hdGlvbiBieSBwdXJjaGFzaW5nIGEga2V5IHVzaW5nIHlvdXIgRXRoZXJldW0gd2FsbGV0LiBUaGUga2V5IGlzIGEgbm9uIGZ1bmdpYmxlIHRva2VuIHdoaWNoIHJlcHJlc2VudHMgeW91ciBtZW1iZXJzaGlwLiAifSwibG9ja3MiOnsiMHgxNGU4MTE5NmU2MGIxMjg1MjdkYjAzZDQwYmRiYTAwNzEwNzc3ODA1Ijp7Im5hbWUiOiJNeUNyeXB0byBNZW1iZXJzIn19fQ==&):


> Thank you for choosing to be a MyCrypto supporter! ❤️

> At this time, your support is a simple donation that helps us continue working to bring you products.

> In the future we'll be further developing this functionality with the Unlock Protocol team to reward supporters with things like custom themes, swag, and more.

> -Taylor & Team MyCrypto


# Getting started

Join [MyCrypto](https://github.com/MyCryptoHQ/mycrypto), [WalletConnect](WalletConnect) and [Eth Gas Reporter](https://github.com/cgewecke/eth-gas-reporter) and receive donations on Github with Unlock! Let's get started.

* The first step is to [deploy your first lock](https://unlock-protocol.com/blog/create-first-lock/). We'd recommend starting with a low price (1 DAI) and short duration (30 days), as well as maybe a limited number of members (100!). These early adopters will probably be your biggest fans! You can also, now or later, add another more expensive lock for other members.

* Then, hop onto our helper page to generate the right configuration for the donation page. You can pick an URL, set up your own call to action, as well as a thank you note that members will be able to see. Add the lock address from the previous step, as well as its name. Once generated you will see a JSON blob that you need to save as file named <code>.unlock-protocol.config.js</code> at the root of your Github repository.

* Once it is saved, you need to head over to your project's settings pages. In the "Features" tab there should be a "Sponsorship" section. Make sure it is enabled. ![enable sponsorship](/images/blog/unlock-donations/enable-sponsorship.png)

* After enabling sponsorships, click on the "Set up sponsor button". This will let you edit a file named `.github/FUNDING.yml` which can also be found in your repository. Replace the last line with Make sure to change `<ORG>/<REPO>` with the actual values for your own repository (you can also certainly use a user repository instead of an organization). <br> `custom: https://donate.unlock-protocol.com/?r=<ORG>/<REPO>`


We'd love to know if you added a sponsorship button through Unlock. Please, let us know in the comments below, maybe we'll become members too!

