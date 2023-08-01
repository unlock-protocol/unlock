---
title: What is a decentralised application, aka "Dapp"?
sidebar_position: 4
description: An informational tutorial about Dapps from a developer’s perspective.
---

# What is a decentralised application, aka "Dapp”?

## What is a “Dapp”?

In this guide, we will cover the properties of a decentralised application, also referred to as "Dapp" or "dApp". We'll explain what we mean by “decentralised” and why we might consider building applications in a decentralised way. Then we'll introduce some tools and technologies that make building decentralised applications possible.

By the end of this guide, you will understand the core properties of decentralised applications and how to know one when you see a Dapp, plus whether it makes sense to build your next application in a decentralised way and how to approach building a Dapp.

### **Characteristics of Dapps**

A "decentralised" application is an app that runs on or stores its data on peer-to-peer networks — not on infrastructure controlled by one person or company. The code for a Dapp is often open source and can run on any computer. The shared data layer provided by peer-to-peer networks allows for new and interesting opportunities for interoperability between applications.

The core values and objectives for decentralised applications are:

- Openness (typically open-source code) and transparency over secrecy and obfuscation&#x20;
- Interchangeable frontend applications / bring your own data
- Auditable history of interactions / reputation
- No central authority or ownership over software and data access

Other common features of decentralised applications include:

- Public / private key based identity / [Decentralised Identifiers](https://www.w3.org/TR/did-core/) (DIDs), **not** username/password
- Hash-based addressing using [Distributed Hash Tables](https://www.ietf.org/proceedings/65/slides/plenaryt-2.pdf) (DHT) rather than filesystem location-based Uniform Resource Locators (URLs)
- Alignment of incentives / incentive mechanisms / “[tokenomics](https://coinmarketcap.com/alexandria/article/what-is-tokenomics)”

### **What does a “Dapp” look like in practice?**

Unlock Protocol's checkout application is a “Dapp” that allows you to buy NFT "keys" on the blockchain. Due to the transparency of the blockchain, anyone operating an app or hosting an event can query the global shared ledger to see that you own a particular key and make decisions based on that information.

As a developer, you can use a user's NFT-based verification to, for example, unlock restricted content on your website, include the user in group chats in Discord or Telegram, reward the user with free treats at a vending machine, or allow them to jump the queue for entry to ticketed events.

Common standards allow these checks to be easy and flexible. For example QR codes can be generated containing a cryptographic proof of your ownership of a key.

### **Why build decentralised applications?**

Apps built on decentralised networks become part of a shared digital landscape. One application can act on events or display information from other applications on the network. This common fabric allows software to become increasingly connected, interoperable, and collaborative.

In practice, this means that rather than each integration requiring special attention to handle the specifics of an Application Programming Interface (API) designed uniquely by each app and managing credentials for each of them, a single unified API — such as the JavaScript Object Notation Remote Procedure Call (JSON-RPC) interface in the case of Ethereum — provides standardised access to data and events from any application running on the network, without any central coordination between them.

In this system, applications are incentivised to be as open and accessible as possible to become useful components in the global toolset and increase their usage and relevance. It’s similar to the way each LEGO brick in a set fits together in many combinations with no special consideration beyond what the piece is for. Users gain more control over the components they use, perhaps swapping one brick out for another, or combining bricks in ways that create unique outcomes that weren’t conceived by the creators of those pieces.&#x20;

Competing user interfaces can provide different perspectives on the same data and events. Users can bring their assets, data and social graph with them when they begin using an application. If one application begins displaying excessive advertising, the users can switch to another with continuity of their data and social connections. Today, you can’t quit Twitter because you disagree with their moderation policies and take your tweets and existing followers with you to a network that does it the way you prefer. If Twitter were built on a decentralised protocol (such as [Lens](https://lens.dev/) or Twitter’s own [Bluesky](https://blueskyweb.org/) initiative), this would become possible.

In recent decades, we've seen the technology giants gather power to moderate and mediate our networks, relationships, and access to information. By building decentralised networks and applications, we build for the long-term public good on infrastructure that remains neutral and gives users the power to choose their own adventure.

### **What technologies are used to build Dapps?**

Bitcoin is one of the earliest Dapps. It's the "decentralised money app". Dapps build on top of that core example of an immutable ledger, and add more complex functionality.

Dapps typically use [public and private key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography) to manage user identity and credentials instead of usernames and passwords, rely on public blockchains to control value transfer and important persistent application state, and offload high volume data storage to other networks such as the [Interplanetary File System](https://ipfs.io/) (IPFS) where possible. You can read more about IPFS in the technology introduction below.

Dapps often make use of public “smart contract” blockchain networks like Ethereum, but this is not the only tool in the box.

#### **Public blockchains (Ethereum, Solana, Avalanche and others)**

Public blockchains enable value exchange and typically allow the publication of Smart Contracts. Smart Contracts create a novel playground for experimenting with programmable money and digital assets. The development of public blockchains has led to the creation of a multitude of digital tokens, decentralised exchanges, a variety of decentralised finance components (sometimes dubbed "[money LEGO](https://medium.com/totle/building-with-money-legos-ab63a58ae764)"), and Non-Fungible Tokens (NFTs). This has empowered and inspired developers around the world to run new experiments and build new things since the advent of public blockchains.

#### File s**torage networks (IPFS, Arweave, Filecoin)**

Blockchains are only able to store small amounts of data, due to current-day constraints of decentralisation. Decentralised storage networks are able to store large files (eg. hi-resolution images and videos) among many nodes, retaining some of the core principles of decentralisation.

This is achieved by removing the requirement of every node on the network to store every piece of data, as most blockchains do. Nodes on IPFS opt-in to _only_ the specific data that they’re interested in. Arweave distributes data between a subset of all nodes, ensuring a level of redundancy. In both cases, files are accessed using the hash of the file, rather than using a location on a filesystem on a specific server. This means that changing the file also changes its address. You can trust that a file appearing at a particular hash will always be the same file. If the file changes, so does the hash, meaning the reference to the file must be changed. This provides assurance that the file you were served is the one you expected.

_An example of this concept in practice within the Unlock Protocol ecosystem:_&#x20;

When you create a Lock, you also create Keys (NFTs). Each NFT Key can have an image (.jpeg, .png, .gif etc.) attached to it, which can be shown to represent the NFT on websites or marketplaces. High-resolution, custom images tend to be large files that are too expensive to store on a blockchain. To work around this, Unlock Keys allow you to define a reference to where the file is stored in the NFT metadata. When you point this reference to a file hash stored on IPFS, the image can be retrieved from that network and rendered where the NFT is viewed. The only requirement is that someone, somewhere is running an IPFS node that hosts the file. There are a number of services that run IPFS nodes that guarantee someone hosts your files, such as [nft.storage](http://nft.storage) or [pinata.cloud](https://www.pinata.cloud/).

#### **Data networks (Ceramic, Gun, The Graph)**

Many applications require unique data structures that don’t fit into the paradigm of smart contracts on a blockchain and aren’t static files that never change. This could be a blog post, or a tweet, or the notion of one user following another user. Some data queries can be difficult to run on blockchains due to the use of data structures optimised for efficiently storing and writing data rather than reading it. **Data networks exist to solve this problem.**

[Ceramic](https://ceramic.network/) and [Gun](https://gun.eco/) allow peer-to-peer data storage and syncing without any financial implications or transaction fees, operating more like IPFS than Ethereum. Nodes opt-in to hosting the data they care about; they don’t attempt to store everything.

Ceramic is also a marketplace for these data models, providing common formats and interfaces for sharing data between applications in a decentralised way.

[The Graph](https://thegraph.com/) is a network of nodes indexing blockchains and storing the data in a way that’s more convenient for running complex queries. It provides a unified GraphQL API to fulfill these requests and creates a marketplace to incentivise nodes to host and serve this data.

#### **Node and data access solutions (Infura, Alchemy...)**

While running your own node is similar to running any other kind of server, it's often difficult to do at scale. There are a number of providers that make it easy to access blockchain data at scale without having to run your own complex infrastructure. This leads to the criticism that many self-described decentralised applications rely on these centralised services, making them centralised in practice. While this is partly true, being able to move to a different provider or to operate your own node infrastructure when viable while retaining your data and relationships still honours the spirit of decentralisation. You don’t have to ask anyone to export your data, you already have full control. Some examples of this type of service are [Infura](https://infura.io/), [Alchemy](https://www.alchemy.com/), and [Moralis](https://moralis.io/).

## C**onclusion**

We've talked a little about what a decentralised app is, why it might be desirable to build one, and some of the large number of tools and technologies available to help you do it. We can see that decentralised applications can be a little more complicated than their traditional counterparts, but it doesn't have to be all or nothing — you can opt-in to the parts that make sense for your needs.

For example, selling tickets with Unlock Protocol is compatible with any website, so offering [NFT event tickets](https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/) and making them on-chain collectables after the event could be an optional addition to any ticketing platform or event website. You don't have to run the whole site on decentralised tech to become part of the ecosystem and receive some of the benefits.

**To recap:** The most important features that differentiate a more decentralised “web3 Dapp” from an ordinary app deal with how users authenticate and how their data is stored. Each of these improves portability of data between applications, removes restrictions and reliance on one central authority, and gives users more freedom and control:

- Users authenticate themselves with a cryptographic public/private key signature, not a username and password validated by a centralised server.
- Important application state (like Keys for an Unlock Lock) and user data (like a post or tweet) is stored on a public blockchain like Ethereum and/or a peer-to-peer data network like Ceramic.
- Files and media are stored on peer-to-peer storage networks like IPFS or Arweave.
- Code is open source and available to be run anywhere, whether on a standard server, IPFS or your laptop, and is able to access and manipulate the same data from anywhere without asking for special permission beyond a cryptographic proof of identity.
