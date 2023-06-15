---
title: Guild.xyz hook
subTitle:
description:
author: Julien Genestoux
publishDate: June 15, 2023
image: /images/blog/guild-hook/guild.xyz.jpeg
---

The Unlock Protocol has a unique feature that lets developers change the behavior of an Unlock [membership contract](https://docs.unlock-protocol.com/core-protocol/public-lock/) while still leveraging most of its logic. These additional pieces of functionality are accessed via “[hooks](https://docs.unlock-protocol.com/core-protocol/public-lock/hooks)”. One of the hooks is the [`onKeyPurchaseHook`](https://docs.unlock-protocol.com/core-protocol/public-lock/hooks#onkeypurchase-hook) and it is triggered when new members are purchasing a membership NFT.

One of the most frequent feature requests for Unlock has been the ability to restrict who can purchase a membership. Last year, we introduced a [CaptchaHook](https://github.com/unlock-protocol/captcha-hook) which requires users to go through a Recaptcha validation and prevents bots from being able to buy NFTs in bulk. We also introduced a hook to [require a password](https://unlock-protocol.com/blog/password-required-hook) when going through the checkout.

But we are still seeing demand for a more flexible approach, where a smart contract administrator (who is called a “lock manager” in the Unlock ecosystem) wants to only allow people in a specific allow-list, or people who own a certain amount of a specific token, or even users who have minted an NFT of a special kind to have access to mint or claim a membership.

Rather than build this complicated logic ourselves, we partnered with our friends at [Guild.xyz](https://guild.xyz) to build a general-purpose Guild Hook! With the Guild Hook, a lock manager can point to any Guild they created and Guilds are extremely flexible!

Let’s go ahead and create an example!

## Guild and Unlock Protocol integration using the Guild Hook

Let’s say I only want people who [follow Unlock on Twitter](https://twitter.com/UnlockProtocol) to be able to claim a membership [from this membership contract.](https://goerli.etherscan.io/address/0xd36695BDF1A17BC4B0aA318d02c60F6e108CB653)

1. First, I will go to [Guild.xyz](http://Guild.xyz) and create a Guild whose **requirement** is to follow Unlock on Twitter.

![Guild.xyz Requirements](/images/blog/guild-hook/requirements.png)

2. Then, once the [Guild has been created](https://guild.xyz/the-unlock-followers), I come back to the Unlock dashboard, go to the advanced settings for my lock, and select the Hooks section.

![Guild.xyz Settings](/images/blog/guild-hook/unlock-hook-settings.png)

3. I can then save the changes and my membership contract is now **\*\***hooked**\*\*** to the Guild of the Unlock Protocol followers on Twitter!

Now the requirements are set, and there is one more step to go.

The last step is to build a checkout URL, [like this one](https://app.unlock-protocol.com/checkout?id=23d15cce-8423-4761-ba48-6dd5ab5a048c), through which users are prompted to join the Guild, if they don’t already, before they can mint their NFT membership!

![Guild.xyz Settings](/images/blog/guild-hook/unlock-guild-checkout.png)

Like always, we’re excited to see what creators, conference organizers and others are doing with this! We also want to inspire developers to create more hooks that can change the behavior of the lock contract based on their own needs and requirements!
