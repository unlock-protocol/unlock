---
title: Ethereum Name Service Support
subTitle: We added support for Ethereum Name Service in the Unlock Dashboard
authorName: Julien Genestoux
publishDate: October 24, 2019
description: Humans are not equiped to make sense of Ethereum addresses, the Ethereum Name Service makes it easy to recognize, remember and type addresses, in a fully decentralized way!
image: /images/blog/ethereum-name-service/ethereum-name-service.png
---

In the Ethereum ecosystem, accounts are identified by addresses. These addresses are public keys which all start with `0x` followed by 42 hexadecimal 'digits'. It's a great unique identifier for machines, but, for most people, it is impossible to read, remember, recognize or even just type!

Wallets provide tools like copy and paste, or QR codes to simplify the process of sharing an address. They also often add the ability to record an "alias" for addresses which should make it easier to identify previously recorded addresses.

Another approach is to use the [Ethereum Name Service](https://ens.domains/). This system, akin to the Domain Name System, lets people register names for their addresses, on chain. This allows other application and people to identify these addresses and show a human-friendly name instead of the long hexadecimal string.

At Unlock, we registered the `unlock-protocol.eth` name!

Our Dashboard shows addresses in several places: to tell the user their current address (useful for people with multiple addresses), to show creators the addresses of their locks, as well as to list the key owners.

We're proud to announce that we now fully support the Ethereum Name Service! For every address displayed in the UI, if a reverse look up resolves to an existing ENS domain, we will show the ENS domain as you can see on the screenshot below!

![Dashboard Lock](/images/blog/ethereum-name-service/ens-enabled.png)

If you have not done so already, think about [registering your own ENS domain today](https://app.ens.domains/)!






