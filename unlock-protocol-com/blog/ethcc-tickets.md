---
title: EthCC Tickets
subTitle: Conference Tickets are short term memberships!
authorName: Julien Genestoux
publishDate: December 6, 2019
description: The largest annual European Ethereum event focused on technology and community is using Unlock for its tickets!
image: /images/blog/ethcc/ethcc.png
---

We are very proud and excited to announce that the [Ethereum Community Conference](https://ethcc.io/) is using Unlock to sell crypto tickets!

The Ethereum Community Conference is the largest annual European Ethereum event focused on technology and community. It is organized by the great Ethereum France 🇫🇷 team and 2020's edition will be held between March 3rd and 5th!

[![Get Ticket](/images/blog/ethcc/ticket.png)](https://ethcc.io/buy-tickets.html)

Like all other locks, the [ETHCC 2020 lock](https://etherscan.io/address/0x7fe9143379a59329afd7d25e52696a6f1db28d36) implements the ERC721 specification, which means that all tickets are Non Fungible Tokens! When we spoke with Marc and Bettina they told us that they needed to be able to collect attendees' information (email...) and we embarked on a crazy idea: storing that information inside of the NFT itself, as metadata!

If you decide to purchase your ticket using crypto (you should!), their website will prompt you for your full name, email and phone number. If you submit that information, your web3 browser of choice will prompt you to sign it: it is then saved in a way that only the lock owner (the EthCC team) will be able to read.

After that, you will receive the NFT by approving the DAI transfer, and the make the actual purchase.

Once the purchase transaction is final, like any other token, the token has its own metadata (image, name, description... ). Here is the metadata for [my ticket to EthCC](https://locksmith.unlock-protocol.com/api/key/0x7fe9143379a59329afd7d25e52696a6f1db28d36/1):

```
{
  "name": "Unlock Key",
  "description": "A Key to an Unlock lock. Unlock is a protocol for memberships. https://unlock-protocol.com/",
  "image": "http://locksmith.unlock-protocol.com/lock/0x7FE9143379a59329AfD7D25E52696A6F1Db28D36/icon",
  "attributes": [
    {
      "trait_type": "Expiration",
      "value": 1603993566,
      "display_type": "date"
    }
  ],
  "userMetadata": {}
}
```

As you can see, there is a field called `userMetadata`. By default, unless the call is authenticated, it is left empty... because this data is not public! However, if the metadata was retrieved by the EthCC team, then it would show the information I saved during the key purchase.

![Attendee List](/images/blog/ethcc/attendee-list.png)

Thanks to this feature, the EthCC team can easily list all attendees and their information, by just listing the key owners and their respective metadata. They can also export that list as CSV ;)

Additionally, when I check in with a QR code on March 3rd, the EthCC team will be able to instantly see all of the metadata linked to my ticket!

After [EthWaterloo](https://unlock-protocol.com/blog/ethwaterloo-tickets/), we're more and more excited about being able to provide our ticketing solution to more and more Ethereum events around the world. We believe that with our support for credit card purchases and the ability to collect attendee information, <strong>Unlock's tickets are now comparable to non-crypto based solutions, yet, decentralized</strong>!
