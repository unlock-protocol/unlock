---
title: Token-gating Telegram with Unlock Protocol and Guild.xyz!
subTitle: How to token-gate Telegram in minutes
authorName: Christopher Carfi
publishDate: March 25, 2022
description: Here's how to token-gate a Telegram chat with Unlock Protocol and Guild.xyz in minutes.
image: /images/blog/guildxyz-telegram/telegram-with-correct-key.png
---

Earlier this month, we showed you [how to token-gate a Discord server](/blog/guildxyz-launch) using Unlock and Guild.xyz.

Today, we'll show you how to token-gate a Telegram chat with Unlock as well.

Before jumping into Guild and Telegram, make sure you have [set up a lock from the Unlock dashboard](https://docs.unlock-protocol.com/unlock/creators/deploying-lock). Remember the name of your lock.

Now, create a guild on [Guild.xyz](https://guild.xyz/). Connect your wallet, name your guild, give it a description, and select `Telegram`.

![guilda-png](/images/blog/guildxyz-telegram/guilda.png)

Now, open Telegram and start a new chat.

First, add the Guild bot (@guildxyz_bot) to your Telegram chat.

Then, in Telegram, configure the settings to allow the Guild bot to manage the chat.

Adjust the chat settings (set to Public, add a name, click "Done," then set the chat back to Private and click "Done").

![guild-1-gif](/images/blog/guildxyz-telegram/guild1.gif)

Set the Guild bot as an admin on the chat.

![guild-2-gif](/images/blog/guildxyz-telegram/guild2.gif)

After you've done the above, there will be a chat ID in the Telegram chat. (It'll look something like `-12345678`.) Copy the chat ID, hop back over the the Guild.xyz site, paste the chat ID into the box, and save.

![guild-3-jpg](/images/blog/guildxyz-telegram/guild3.jpg)

Ok! The Telegram side is in good shape now.

Head back over the the Guild.xyz site, and set up the token gate using an Unlock lock.

![guild-screenshot-gif](/images/blog/guildxyz-launch/unlock-protocol-guildxyz.gif)

Save your updates, and you should be all set!

To invite someone to the token-gated chat, direct them to the Guild site for your guild. When someone attempts to join, Guild will manage the process and, if the visitor has the correct Unlock key in their wallet, Guild will link the new member over to the Telegram chat for you, seamlessly. 

![telegram-with-correct-key.png](/images/blog/guildxyz-telegram/telegram-with-correct-key.png)

![telegram-link-to-chat.png](/images/blog/guildxyz-telegram/telegram-link-to-chat.png)

That's it! You now have a token-gated Telegram chat.

**Related:** Guild's Reka and Raz joined the Unlock Developer Meetup earlier this month and shared more thoughts!

<div style="position: relative; overflow: hidden; width: 100%; padding-top: 56.25%;"><iframe style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/X5DKS48rDBE" title="Unlock Protocol and Guild.xyz Integration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
