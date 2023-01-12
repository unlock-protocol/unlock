---
title: Introducing Swordy Bot
subTitle: Manage your community auto-magically!
authorName: Patrick Gallagher
publishDate: March 29, 2021
description: Thanks to the Unlock developer community, you can now use Unlock in Discord.
image: /images/blog/swordy-bot-intro/thumbnail.png
---

> Guest written by Community builder Patrick Gallagher

Discord and Telegram are the best places for tech-savvy teams or communities to chat. And with any new communication platform, we need a way to isolate the signal from the noise.

To solve this, we built Swordy Bot. The bot is integrated with Unlock Protocol, so you can limit access to only community members who hold a specific Lock token (NFT). Best of all, its completely automated!

![A few discord channels with locks](/images/blog/swordy-bot-intro/channels.png)

If the user doesn't have the necessary Lock token in their wallet, they are directed to the Unlock Protocol app, where they can purchase one.

Big thank you to the Unlock Protocol for sponsoring this bounty. Working with the team has been a breeze, and its really cool that they support people who want to build with their protocol. If you're a developer, I definitely would recommend looking at their other bounties.

## How it works

It uses complicate machine learning... just kidding! It's actually pretty simple. The bot checks the user's wallet for the appropriate key to the Lock. If they have it, then the user earns the appropriate roles.

The basic steps for setting up the bot are:

Step 1. Add the bot to your server at [swordybot.com](https://swordybot.com)

Step 2. Add the requirements for a role using `!add-lock`

<img src="/images/blog/swordy-bot-intro/add-lock.png" alt="A admin invoking the !add-lock command" height="100px"/>

Step 3. Users can get access using the `!unlock` command

<img src="/images/blog/swordy-bot-intro/invoke.png" alt="A user invoking the !unlock command" height="100px"/>

If successful you'll see a message like this, giving you some new roles:

<img src="/images/blog/swordy-bot-intro/knighted.png" alt="A message from the bot that the user has been assigned roles" height="200px"/>

## How I built it

Integrating with Unlock Protocol was extremely simple. The magic all happens in this one line of code where I call the `getHasValidKey` function on the appropriate contract.

```js
const hasValidKey = await lockContract.getHasValidKey(userAddress)
```

If you're interested in building your own bot, or building with Unlock, most of the code for Swordy Bot is available [here](https://github.com/pi0neerpat/unlock-protocol-bot/blob/e448d1f81a49c4b0b021d09bb623991ae87c55f5/api/src/lib/unlockProtocol/unlockProtocol.js#L26).

## What's next

We are super excited to continue building. Let us know what you want to see and give us feedback in our [Discord](https://discord.gg/Nw3y4GtBSh)

If you like where we are headed, consider <a href="https://twitter.com/swordybot?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">follow @swordybot</a>