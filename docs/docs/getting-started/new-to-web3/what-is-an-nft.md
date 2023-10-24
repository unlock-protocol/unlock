---
title: What is an NFT?
sidebar_position: 5
description: An informational tutorial covering tyhe basics of NFTs from developer’s perspective.
---

# What is a Non-Fungible Token (NFT)?

In this document, we'll answer the question _"What is an NFT (Non-Fungible Token)?"_ We'll start with a simple explanation of what a token looks like on the blockchain and give some examples of how these are in use in the wild today. We'll mention some of the new ideas recently emerging and we'll briefly introduce some popular products and recent trends.

When you've finished this guide you'll have an understanding of what an NFT is in practical terms and perhaps why you might want one (beyond just having a cool profile picture!).

First, we better discuss the acronym NFT itself.

**What do "fungible" and "non-fungible" mean?**

Fungible means interchangeable. If I take one Bitcoin and replace it with another one, it makes no difference. The coins are fungible. But if you choose a unique piece of art and I replace that with a random Rothko you're not going to be happy. Your artwork is non-fungible, a bitcoin is fungible.

Non-Fungible Tokens (NFTs) are different from fungible tokens because they are uniquely distinct from each other.

What is it that makes a token non-fungible like that? That's where the smart contract comes in.

**A blockchain mapping**

In its simplest form, an NFT is a smart contract which manages a mapping between a list of unique token identifier numbers and an owner address for each one.

```

Token ID#10 => 0x2123...ff34

Token ID#11 => 0x5123...f24f

Token ID#12 => 0x1223...f223

```

This blockchain record shows which address owns which token id number. It's the cryptographic proof of your control over that token id in the global ledger.

Alongside this mapping in the contract is a set of functions to manage the exchange of these token identifiers and find out more information about them. How these functions behave is part of a series of NFT standard specifications which originated as Ethereum Request for Comment (ERC) proposals.

## NFT smart contract standards

[ERC721](https://eips.ethereum.org/EIPS/eip-721) and [ERC1155](https://eips.ethereum.org/EIPS/eip-1155) are the most common NFT standards in the Ethereum ecosystem, although there are new proposals to further advance these.

The main difference between the two standards is that all ERC721 tokens in a contract collection are individually unique, whereas ERC1155 tokens can issue a set of more than one of each token in the collection.

These specifications define how to manage ownership of the tokens - the mapping of token id to owner address - and the information associated with the token. This often includes a URL or IPFS hash for retrieving **metadata** (including the image) about the token from another service.

As long as they adhere to the basic spec for compatibility, tokens are free to include additional functionality to support their product or utility.

## Tokens are a new digital primitive

Tokens are a new digital primitive. Like websites began as simple text documents with links and pictures, then gradually evolved into YouTube, Facebook and TikTok over the next twenty years, tokens are a new programmable building block we can use to build and own digital items that weren't possible before.

## Common use cases today

What are some common use cases for NFTs right now, other than trading expensive pictures of monkeys?

Most notable are NFT-based [event ticketing](https://events.unlock-protocol.com/), media memberships, DAO memberships, [online credentials](https://certifications.unlock-protocol.com/) and proof of attendance records, and digital colectibles. All are being done today.

Here's a quick overview of how tokens help achieve these outcomes and an introduction to some of the companies working on ideas in the space.

### NFT Ticketing

Online and IRL event ticketing are a natural use cases for NFTs. The verifiable uniqueness and authenticity of an NFT ensures that a ticket presented for an online or IRL event is authentic. Mechanisms like non-transferrable NFTs also act as a deterrent to ticket scalping.

> Related: [How to sell NFT tickets for an event](https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/)

### NFT subscriptions for Media and DAO memberships

Subscription NFTs can act like membership cards that provide access to content websites (e.g. media paywalls), online and offline communities (e.g. membership cards), or members-only benefits. Unlock extends this core function in an important way, enabling NFT-based membershps to be time-bound (e.g. for a day, month, year, or any other lenght of time).

> Related: [Creating a media membership paywall with Unlock and WordPress](https://unlock-protocol.com/guides/guide-to-the-unlock-protocol-wordpress-plugin/)
>
> Related: [How to token-gate a Telegram DAO channel](https://unlock-protocol.com/guides/how-to-token-gate-telegram-with-unlock-protocol-and-guild-xyz/)

### Online credentials and Proof Of Attendance Protocol (POAP) records

Since NFTs can be set to be non-transferrable and can be granted to particular individuals, using NFTs for online credentialing and certification is a natural use case as well. Once someone shows mastery of a topic by completing an exam or exhibiting skills using another mechanism, a time-based NFT can be issued to verify that skill on-chain.

> Related: [How CDAA implemented online credentials using NFTs](https://unlock-protocol.com/blog/cdaa-unlock-case-study)

POAP stands for "Proof Of Attendance Protocol". POAPs are NFTs that are granted to people in attendance at events, whether virtual or in the real world. The POAP smart contract restricts the tokens from being transferred, and the tokens can only be claimed during an event. The tokens then act like an old paper ticket stub, a way to remember and prove you were in attendance at an event and can be used to provide special memberships or benefits only to those early supporters.

> Related: [How to do POAPs with Unlock](https://unlock-protocol.com/guides/how-to-do-poaps-with-unlock/)

### Art projects and profile pictures

"Profile picture collection" NFT projects became very popular in 2021. The NFT contract for these tokens references a metadata file for each token identifier which in turn points to an image file of the picture in question. Exchanging these tokens means you own a pointer to an image file, not the image file itself. It's important to make sure the image is saved somewhere it can't be removed, to maintain the correctness of the immutable blockchain reference.

> Related: [How to customize a PFP collection on OpenSea](https://unlock-protocol.com/guides/customizing-locks-on-opensea)

## New ideas for Non-Fungible Tokens

New ideas for how NFTs can be used appear often. Two of the most interesting recent developments are "dynamic NFTs" and "Soulbound NFTs."

### Dynamic NFTs

Dynamic NFTs allow for the metadata the token references to update and change based on certain criteria in a trustless or predictable way while keeping the ownership of the token unaffected. This has interesting use cases for games, where items might change or mutate according to other items used, spells cast or achievements completed. Here is an example of how dynamic NFTs can be used: https://unlock-protocol.com/blog/dynamic-nft

### Soulbound NFTs

The key property of Soulbound NFTs is that they can't be transferred, and they will be attached to a living real human. The idea was recently floated in a research paper to which Ethereum inventor Vitalik Buterin contributed. You can read more about Soulbound NFTs in the paper, "Decentralized Society: Finding Web3's Soul": https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763

## Conclusion

We've talked about the basic blockchain representation of an NFT on the token identifier being a simple relationship between a token id and an owner's wallet address, how the behaviour of those tokens is fleshed out with functionality in a smart contract, and some of the common use cases for NFTs today, and some of the emerging capabilities now coming into use.

In summary, NFTs can be a lot of things. The simple concept of token identifier being exchanged on the blockchain coupled with the infinite possibilities of a programmable blockchain is a powerful tool for building interesting new ideas.
