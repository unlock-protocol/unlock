---
id: litepaper
title: Litepaper
image: /img/more/litepaper-share.jpg
sidebar_position: 1
description: >-
  Unlocking the web’s new business model.
---

# Unlock Protocol Litepaper

_(Prefer to read this offline? [Click here to download.](https://19942922.fs1.hubspotusercontent-na1.net/hubfs/19942922/Unlock%20Protocol%20Litepaper%20rev09192024.pdf))_

## Changelog

09192024: Update to add information about UP token and DAO migration to Base

07112022: Initial Litepaper publication

## Introduction

The internet has evolved to be the operating system for humanity, providing the underlying architecture upon which we communicate, travel, collaborate, teach, learn, transact and even have feelings.

Until now, the internet has been mostly monetized through attention; advertisers pay to be featured “next to” the content that attracts viewer and reader eyeballs. In the last few years, it became clear this model has a number of unintended consequences including erosion of privacy, low-quality information diets, increased distrust in institutions, concentration of power, and other externalities.

In contrast to the attention-based business model for the web, a membership-based business model enables a creator to be fairly and transparently compensated directly by their community without the negative externalities of the attention-based web business model.

Organizations including The New York Times, Netflix, Patreon, and others have successfully embraced membership-based business models. Unfortunately, the historic infrastructure to implement memberships has been ad hoc and has been implemented across the web by way of a series of silos, most of which are incompatible with each other.

The concept of a “membership” is a fundamental part of business interactions, and underpins a number of business models. For example:

- **Subscription business models** — A subscription is a recurring, time-based membership
- **Ticketing** — A ticket is a membership that enables access to a particular place for a particular period of time on a particular day
- **Certifications** — A certification is a membership to the group of individuals who have completed a course or passed an exam

**We believe there is a way to make memberships better and, as a result, we believe there is a way to make _the web_ better.**

Unlock is a protocol developers, creators, and platforms can use to create memberships. Unlock’s goal is to ease implementation and increase conversion from “users” to “members,” creating a much healthier monetization environment for the web.

In short, Unlock is an open-source, collectively owned, community-governed, peer-to-peer system that creates time-based memberships.

There are a number of interdependent components of Unlock. These are:

- **Unlock Labs:** The core team that created and currently maintains Unlock Protocol.
- **Unlock Protocol:** A suite of upgradable smart contracts that create memberships as NFTs.
- **The Unlock Ecosystem:** A community of creators, distributors, and consumers who share ownership of Unlock Protocol through their contributions using the protocol.
- **[Unlock DAO](../../governance/unlock-dao/):** A decentralized organization of token holders who govern and control Unlock Protocol. The Unlock DAO's stated mission is "The Unlock DAO is a global community of developers, creators, and organizations dedicated to decentralized access and distribution. We act in full service of Unlock Protocol by guiding individuals and groups to empowerment. We provide education, grants, collective governance, enhanced tools, and guidance for building on top of the protocol."
- **Unlock Tools**: Front-end convenience applications built by Unlock Labs to further sustainable innovation on Unlock Protocol.
- **The Unlock Protocol Foundation:** The role of the Unlock Protocol Foundation is to promote and encourage adoption of the Unlock Protocol.

Unlock Labs created Unlock Protocol to provide an open, shared infrastructure for memberships that removes friction, increases conversion, enables scale, reduces costs, and evolves the web from a business model built on attention toward one based on membership.

Unlock Protocol belongs to the Unlock Ecosystem, not Unlock Labs, and is governed by the [Unlock DAO](../../governance/unlock-dao/).

We aim for Unlock Protocol to be the primitive for every membership, both online and offline, around the globe. Together, we will create an internet owned and monetized by creators and their supporters.

## Why memberships matter

The web's business model has always been based on "attention" via advertising. In hindsight, it’s now clear to see that the attention-based business model of the current web created many unexpected externalities and consequences.

One of these consequences was a concentration of power. For example, if a brand wants to spend $10M on an advertising campaign, it's much easier for that brand advertiser to go to a single platform such as Google or Facebook to execute that campaign rather than go to 100 smaller sites and offer them $100k each. It’s easier for advertisers to manage and coordinate relationships with one huge partner versus 100 smaller ones.

There is an alternative to the attention-based business model. Since the early days of the web, membership communities have been a part of the online experience. From early bulletin board systems, to Usenet groups, to today's social networks, groups and communities have been a core primitive of the web.

Truly web-scale payment protocols now exist and make the membership model feasible at scale. Instead of paying their attention (and unleashing the externalities of the attention-based business model), users — members — can pay small amounts directly to creators and earn the right to access, read, write or even obtain status in the online communities they care about. Monetizing memberships is precisely what The Wall Street Journal and The New York Times have done in-house, what Netflix, Spotify, and Medium have built into their platforms, and what Patreon and OnlyFans have done for individual creators.

We think the membership primitive needs a standard of its own so that memberships are not siloed across an ever-expanding collection of disjointed platforms, none of which recognize each others’ members. Instead, the web needs a membership protocol that reduces friction for smaller web applications and websites, enables them to implement membership programs in a straightforward and consistent manner, and empowers members to "unlock" and control their memberships.

## How does Unlock work?

Since it is a true protocol, Unlock is built onchain. This makes Unlock-based memberships permissionless and decentralized. Building onchain provides built-in identities (via [wallets](../new-to-web3/what-is-a-crypto-wallet/)), currencies, and payments, as well a way to represent the individual memberships as non-fungible tokens ([NFTs](../new-to-web3/what-is-an-nft/)).

With Unlock Protocol, each creator deploys their own membership contract from a common template. Unlock Labs built a frontend application that provides an interface for this, but other platforms and applications can also implement their versions of the user interfaces as well.

The membership contracts can be integrated into any application or platform, and an application can alter its behavior based on whether a user has a valid membership or not. If a user does not have a valid membership, the application can prompt them to buy one. (Here again, Unlock Labs has created an interface that can be readily used, and developers are free to create their own implementations of this interface as well.)

Each membership created using Unlock Protocol is a non-fungible token. This NFT represents the relationship between a creator and a member for the duration of time that membership is valid.

## Protocol value accrual

Protocols inherently have value, and shared protocols such as HTTP, SMTP, TCP/IP, and others have produced immense value. However, early internet protocols were unable to capture economic value because, when they were created, there was no mechanism to do so.

While these protocols enable the web to work, the value they created was instead captured at the application layer that was built on top of these protocols. This value was largely captured in the form of user data, and was primarily captured by a few internet platforms.

Like the protocols mentioned above, Unlock Protocol is valuable at scale. However, unlike these protocols, Unlock Protocol has been architected such that value accrues to its governance token, the Unlock Protocol Token (UP).

UP rewards are granted upon each purchase transaction that uses Unlock Protocol. The rewards are based on two factors:

- The gas consumed by the purchase transaction.
- The actual value added to the protocol’s Gross Network Product (total value exchanged in the network).

## What can you do with Unlock Protocol?

Unlock is a protocol for *memberships*. Our goal is for Unlock to support multiple kinds of memberships, enable easy integration of these memberships into any application, and share the protocol’s ownership with its adopters.

At its core, Unlock Protocol supports three main functions: minting, gating, and earning.

### Mint: Create a membership NFT

Memberships can be created via the minting process into two ways:

- Memberships can be purchased by users. Users can purchase a membership for themselves or others. These memberships may be purchased once or renewed on a recurring basis.
- Memberships can be earned. The "manager" of a membership contract can airdrop or grant memberships to users at their discretion.

Once minted, members and managers can extend, cancel, terminate, or even "destroy" a membership.

Since these memberships are represented as NFTs, managers and members can define the metadata of the NFT itself. An NFT’s public metadata — for instance, the image associated with a particular token or collection — can be updated, changing the NFT’s associated artwork or visual representation. Similarly, an NFT’s private metadata (e.g. member information, application data, or references to associated assets) can also be updated after minting.

### Gate: Members-only access to perks, benefits, and resources

The core protocol includes functions to quickly identify a user's membership status. These functions can immediately determine if someone's membership is currently valid or if it has expired. This makes it trivial for an application to alter behavior (for example, token gating content or features) based on membership level or status.

Additionally, the protocol implements ["hooks,"](../../core-protocol/public-lock/hooks/) enabling the option to delegate these membership checks to third-party contracts. This supports use cases of checking for membership based on a wallet holding arbitrary ERC-721, ERC-1155, or ERC-20 tokens from third-party collections.

### Earn: Unlock Protocol is collectively owned by its members

The core protocol aims to be collectively owned and managed by its adopters, embracing a core web3 ethos.

Anyone who implements the protocol in their application can earn UP governance tokens to join the [Unlock DAO](../../governance/unlock-dao/), or may elect to pass those earned governance tokens onto their community members as additional rewards.

[UP](../../governance/unlock-dao-tokens) token owners can submit and vote on protocol upgrades and the allocation of the treasury's funds.

Additionally, the protocol includes a mechanism for lock managers to optionally collect fees on purchases or payments made by members. This fee mechanism is optional and must be approved by individual lock managers.

## Unlock is a protocol, not a platform

A critical aspect of our approach is that Unlock is a protocol, not a platform.

Web platforms — that is, most of the large internet sites that immediately come to mind when you think of “large internet sites” — are collections of servers that require domain names, run on tightly-controlled server farms, and are operated by corporations. These corporations can go out of business, change their terms of service, or unilaterally alter how their platforms and APIs operate, affecting the fate of millions of developers, partners, and users of that platform in an instant.

Protocols are different. Once deployed, a protocol cannot be “stopped,” removed or altered arbitrarily.

In contrast to the centralized platforms of Web 2.0, Unlock Protocol is a set of smart contracts deployed on blockchains running the Ethereum Virtual Machine (EVM). Unlock Protocol was initially deployed on the Ethereum mainnet, and is now available on many other EVM-compatible blockchains as well.

Since Unlock is a protocol, a particular membership contract can only be altered by its “lock managers.” Lock managers are the developers or creators in the ecosystem who deployed that particular contract.

What this means in practice is the users of the protocol control how the protocol works for them. It’s not — and can’t be — controlled by Unlock Labs, or any other entity.

On each network supported by the protocol, the Unlock smart contract, through which the locks are deployed, is collectively governed, and Unlock Labs does not have the ability to remove it. The DAO contract is collectively governed by the [UP](../../governance/unlock-dao-tokens/) token holders.

The core Unlock Protocol source code — in fact, all of the code ever written by the Unlock Labs team — is open-source code using the MIT license. As such, anyone can transparently assess, review or contribute to the code that makes up the protocol.

## Unlock for developers

The technical [core of Unlock Protocol](../../core-protocol/) consists of two Solidity smart contracts. As of this writing, Unlock has had three independent, external teams perform audits of these smart contracts.

The [“Unlock contract"](../../core-protocol/unlock/) is a factory contract that generates all locks, while instances of the ["PublicLock contract"](../../core-protocol/public-lock/) are owned and configurable by individual developers and creators building on the protocol.

### The Unlock contract

This factory contract **[(Unlock.sol)](../../core-protocol/smart-contracts-api/Unlock)** has two roles: deploying locks and accounting for Unlock Protocol Token ([UP](../../governance/unlock-dao-tokens/)) rewards. The contract is upgradable using OpenZeppelin's upgradability framework. Each implementation is versioned.

The Unlock contract deployed on each network is directly controlled by the DAO, through a Gnosis SAFE and two specific Zodiac modules that enable cross-chain governance by ensuring provenance and providing a timelock mechanism.

### The PublicLock contract

Users can configure, deploy and update this contract (**[PublicLock.sol](../../core-protocol/smart-contracts-api/PublicLock)**). Instances of PublicLock are ERC-721 compliant contracts.

PublicLock contracts mint and manage membership NFT keys. Keys for one lock are valid only for the lock that created them.

Additionally, the PublicLock contract can restrict access to resources based on the user's possession (or lack of possession) of a specific membership NFT. The PublicLock contract manages access to digital and physical resources, such as blog content, software features, or ticketing to an event.

Each PublicLock is a standalone contract. Once created, each instance of the contract has its own address. As a result, locks are untethered and fully functional even without access to the main Unlock contract.

## What is different about Unlock

There are a number of aspects of Unlock Protocol’s design, governance approach, and technical architecture that make it unique.

### Unlock Protocol’s memberships are time-based and can [expire](../../core-protocol/smart-contracts-api/PublicLock#expirationduration)

Most memberships in the real-world have a time-based component to them. You are a member of your gym for a year, your warehouse club membership has an expiration date, and your online streaming service only grants mobile and commercial-free access to members in good standing.

While there have been a number prior NFT projects that confer “membership” based on the possession of a token, those memberships are binary. If you have the token you’re in, and if you don’t, you’re not.

More troublesome is the fact that those first-generation memberships are also _perpetual_. Once someone has a token, they are a “member” for as long as they hold that token, which could be years or decades. A “perpetual” membership approach means creators have no way to capture the ongoing value their experiences provide to fans or community members, since once a fan possesses a token that grants them access, that fan effectively has “tenure” and has access to benefits in perpetuity.

These legacy “perpetual” membership approaches are especially ill-suited for situations where the membership requires an explicit expiration date (e.g. in the case of professional credentials that expire after a period of time).

Unlock Protocol is fundamentally different in that Unlock-based membership NFTs have a time component to them. When a lock manager deploys a membership contract, the lock manager chooses a “duration” for all memberships. This duration can be for a month, a year, a day, ten years, or even a second. This membership expiry information is stored onchain.

In the creator case, time-bound membership enables an ongoing, two-way exchange of value between creator and fan-as-member. In other use cases, this time-bound aspect of Unlock ensures that members need to have regular renewals of their memberships as appropriate.

Unlock-based memberships can be extended at any point before or after expiration. They can also be expired early either by the lock manager or by the membership owner in cases where a cancellation is required or requested.

### Subscription and recurring revenue support

In addition to being time-based, Unlock memberships can also be [recurring](https://unlock-protocol.com/guides/recurring-memberships/). Recurrence turns a one-time membership into a recurring revenue “subscription.”

The Unlock smart contracts leverage the ability for users to pre-approve amounts to be spent in the future. This means a membership can automatically be renewed multiple times up to that spending approval limit.

The Unlock contracts also include economic incentives for renewals to be managed by third party agents in the Unlock Ecosystem, who are rewarded for ensuring these renewal transactions take place in a timely manner.

Members can cancel the automatic subscription renewals at any point. If a member’s wallet runs out of funds, their memberships won’t be renewed.

### Payment via cryptocurrency or [credit card](https://unlock-protocol.com/guides/enabling-credit-cards/)

With Unlock, memberships can be bought and paid for using credit cards in addition to cryptocurrency. These credit card transactions are handled “off-chain” while still granting an NFT membership to its users.

Credit card support is handled via Unlock Accounts. Unlock Accounts are a convenience application developed by Unlock Labs as described in the Appendix.

### Unlock memberships can be “soul-bound”

By default, Unlock memberships can be transferred, like any ERC-721 NFT. However, the Unlock contracts include important customizations to this behavior.

For example, the lock manager can disable transfers, rendering their particular membership NFTs non-transferrable. (In some circles, these types of non-transferrable NFTs are referred to as being “soul bound.”)

### Unlock is an open-source, community-governed protocol

As an open-source protocol, anyone can use Unlock. This stands in stark contrast to most existing internet platforms, which are closed-source and opaque.

Moving beyond who can “use” Unlock (i.e. anyone), Unlock Protocol has another important difference from traditional platforms: _anyone can own a stake in how the protocol itself is governed_.

For this, Unlock Protocol has its own Decentralized Autonomous Organization (DAO). As of this writing, the [Unlock DAO](../../governance/unlock-dao/) holds about 10% of the supply of [UP](../../governance/unlock-dao-tokens/) in its treasury and can use these tokens to fund initiatives on its own.

The [Unlock DAO](../../governance/unlock-dao/) owns administrative rights on the Unlock contract, and any changes to the contract will need to be approved by a majority of token holders.

### Unlock implements flexible and extensible smart contracts

Unlock’s smart contracts are based on the ERC-721 standard, with important enhancements.

- **Flexible templates:** Unlock membership contracts are based on the same “template,” guaranteeing consistency across memberships and simplifying integration into third party applications. These contracts are open-source and verified.
- **Support for a wide range of currencies:** When creating a membership contract, the lock manager can choose the price and currency for the membership NFTs (”keys”) minted by that lock. The currency can be the blockchain’s native currency, or can be any ERC-20 contract deployed on the same blockchain. This includes stablecoins like USDC or community and social tokens such as \$FWB.
- **[Extensible:](../../core-protocol/public-lock/hooks/)** Even though the lock contracts are standard, they can be extended by way of “hooks.” These hooks are configurable by a lock manager in order to alter the behavior of the contract on specific state changes such as purchases and transfers. Hooks can also be used when reading the status of a specific membership or when retrieving a token’s metadata.
- **[Role-based:](../../core-protocol/public-lock/access-control/)** The lock contracts include several roles in order to granularly configure the contract or specific memberships. For example, the lock manager role is considered to be the administrator of the smart contract and has all administrative roles, including upgrading the contract to a newer version of the protocol.

  A lock can have multiple managers and the manager itself can also be a multi-sig wallet or a DAO to enable collective management and collective ownership of the contract. Other roles include:

  - **Key granter:** This role can “grant” (airdrop) membership NFTs.
  - **Beneficiary:** This role can receive funds when they are withdrawn from the lock.
  - **Key owner:** The “member” who has a membership.
  - **Key manager:** The address that can transfer or cancel a specific membership. By default, it is the key owner, however, this role can be decoupled, especially in the context of airdrops.

## Key use cases for Unlock Protocol

While most of the initial buzz around NFTs has centered around a single early use case of digital collectibles, it’s important to remember that NFTs are a fundamental technology. Membership NFTs are a protocol-level building block that can be integrated into myriad applications. The examples shown here are illustrative, but not exhaustive.

### [Event ticketing](https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/)

Event ticketing is a natural use case for membership NFTs. At its core, a ticket is a membership that grants holders access to a certain place at a certain time for a certain event.

The basic traits of NFTs make them well-suited for event ticketing: they can be easily purchased or airdropped, they are unique, they cannot be duplicated, and they can be set to be non-transferable if the event organizer prefers.

Additionally, using NFTs for event ticketing grants the possibility to expand the relationship between the event organizer or performer and the attendee or fan beyond the limited duration of the event itself.

Since NFTs are portable across different systems, holders of NFTs from a particular event can access special privileges or benefits to future events, view “behind the scenes” content that can only be unlocked with that NFT, or be given several other perks. For example, since NFTs can be dynamic, after a sporting event, your NFT “ticket stub” that was a skeuomorphic rendering of a traditional paper ticket before the event could morph into a high-resolution video collectible of a highlight (e.g. the winning goal) after the event, with different rarity traits and different highlights being distributed to different ticket holders at various membership levels.

**Examples of event ticketing:** DappCon, PizzaDAO, Farcon, ETH.CC

### [Media memberships](https://unlock-protocol.com/guides/how-to-sell-membership-nfts/)

The advertising-based business model has gutted quality journalism and media, and has led to the rise of algorithmically-driven social media feeds that prioritize shock and outrage over civil discourse, all in the name of garnering more eyeballs and clicks.

Membership NFTs are an alternative to the status quo, giving members who hold a particular NFT direct access to the media shared by creators. This applies to the written word, music, videos, images, experiences, and more.

The current attention-based model is great for gatekeepers, and is horrible for creators. [For example, it takes approximately 1,000,000 plays of a music stream on Spotify per month to net an artist \$5000](https://www.digitalmusicnews.com/2018/12/25/streaming-music-services-pay-2019/). (Contrast this to an artist with only 500 members in their fan club, where each member is paying \$10/month. It’s the same revenue to the creator on a fraction of the base, plus the creator has a direct relationship — both emotional and financial — with their fans that can deepen and broaden the experience between them.)

Media memberships can be implemented as content paywalls for written content, access to streams or rich media, passes to physical spaces (e.g. galleries), or any experience the creator desires.

**Examples of media memberships:** Dirt, Coinage, BestDishEver

### DAO memberships

In many first-generation DAOs, membership was granted solely based on an individual holding a certain number of fungible (that is, purchasable or tradable) ERC-20 tokens. This resulted in a number of negative externalities, including DAOs having the potential to be dominated by “whales” who could simply afford to buy-in to the organization, as opposed to having the membership of the organization populated by individuals who contributed to or were aligned with the mission.

Worse yet, since ERC-20 tokens don’t have a “time” component to them (i.e. they never expire), once a whale was in a DAO, they were in for as long as they wanted to stay, potentially forever.

In contrast, NFTs have several unique properties that make them an obvious primitive to use for DAO memberships. Membership NFTs provide access to a DAO’s content website, online and offline communities, members-only benefits, or perhaps even voting rights. Unlock Protocol extends this core function in an important way, enabling NFT-based memberships to be time-bound (e.g. for a day, month, year, or any other length of time), meaning that membership in the DAO is bound to a season, a year, or whatever duration the DAO itself decides is the correct cadence.

This solves the two key problems of ERC-20 based membership qualification for DAOs. First, Unlock Protocol membership NFTs can be set to expire, eliminating the “tenure” issue of ERC-20s where a free-rider who is not contributing still has access to all DAO benefits in perpetuity.

Secondly, a “one-person, one-membership, one-vote” mechanism can be set up, if desired by the DAO itself, in order to avoid the problem of a whale skewing DAO votes based solely on the size of their holdings of the DAO’s ERC-20 treasury.

**Examples of DAO memberships:** [Cabin](https://cabin.city/)

### [Certifications and credentials](https://unlock-protocol.com/blog/cdaa-unlock-case-study)

Since NFTs can be set to be non-transferrable and can be granted to particular individuals, using NFTs for online credentialing and certification is a common use case as well. Once someone shows mastery of a topic by completing an exam or exhibiting skills using another mechanism, a time-based NFT can be issued to verify that skill onchain.

These certifications or credentials can be time-bound, if the situation requires it, expiring after one year, two years, or whatever length of time is appropriate. This is most important where the certification is part of an industry that either is evolving rapidly (e.g. financial services) or has continuing education requirements that necessitate ongoing training (e.g. certain professional fields).

In addition to “educational”-type certifications, another type of credential is a Proof Of Attendance Protocol (POAP). POAPs are NFTs that are granted to people in attendance at events, whether virtual or in the real world. These NFTs restrict their tokens from being transferred, and the NFTs can only be claimed during an event. The tokens prove you were in attendance at an event and can be used to provide special memberships or benefits to only those supporters who were in attendance.

**Examples of certifications and credentials:** CDAA, Climate Frens

### Digital collectibles (PFP project minting)

"Profile picture” (PFP) NFT projects hit the mainstream in 2021, and were the first widely-referenced use case for NFTs. However, when “all there is” is a JPEG referenced on the blockchain, the usefulness of that particular NFT is limited to speculation or social signaling.

The more impactful and creative digital collectibles projects move beyond simply displaying art and have membership at their core. Thoughtful digital collectibles projects integrate access to experiences (e.g. online games), access to metaverse locations (e.g. members-only spaces in Decentraland or other spaces), invitations to members-only IRL meetups, co-creation of the lore and story of the project, and other benefits that go beyond just the “art” displayed on a PFP itself.

Unlock Protocol supports the digital collectibles use case natively, enabling minting of PFP NFTs (and tailoring traits like metadata and imagery), and gating access to exclusive membership perks.

**Examples of digital collectibles:** [Tales of Elatora](https://unlock-protocol.com/blog/talesofelatora)

## How to develop on Unlock Protocol

Unlock Protocol and its community provide a wide variety of resources for developers who are building using the protocol.

### Developer docs

Unlock Protocol’s documentation is organized into the following categories.

- **[The Getting Started:](https://docs.unlock-protocol.com/getting-started/)** An overview of web3 and Unlock Protocol core concepts.
- **[Core Protocol:](https://docs.unlock-protocol.com/core-protocol/)** An overview of the two smart contracts that make up the protocol and a complete interface reference generated from the smart contracts themselves.
- **[Tools:](https://docs.unlock-protocol.com/tools/)** All the information you need about the tooling provided by Unlock Labs for protocol implementation.
- **[Tutorials:](https://docs.unlock-protocol.com/tutorials/)** In-depth articles on specific use cases and implementations.
- **[Governance:](https://docs.unlock-protocol.com/governance/)** Everything you need to know about becoming a DAO member, [UP](../../governance/unlock-dao-tokens/) governance tokens, and voting.

The Unlock Protocol developer docs can be found at [https://docs.unlock-protocol.com](https://docs.unlock-protocol.com).

### Hackathons

Unlock Labs participates in many blockchain community hackathons both in-person and virtually. You can find example repositories in our organization on Github that can be used to build solutions during the course of a hackathon, and many past hackathon projects can be found on the Unlock website [upcoming events page](https://unlock-protocol.com/upcoming-events) and social channels.

Information about when and where to participate in future hackathons can be found on all of our public communication channels.

The Unlock Protocol Github repositories can be found at [https://github.com/unlock-protocol/](https://github.com/unlock-protocol/).

### Community / Discord

At Unlock, our [Discord](https://discord.unlock-protocol.com/) server is the central place for members, developers, creators, grantees, and others who are curious about Unlock. Developers and creators of all levels are welcome to ask questions and to participate in the community discussion.

The Unlock Protocol Discord server can be found via a link at [https://discord.unlock-protocol.com](https://discord.unlock-protocol.com/).

## Unlock Protocol governance

The [Unlock DAO](../../governance/unlock-dao/) is the community of [Unlock Protocol Token (UP)](../../governance/unlock-dao-tokens/) holders governing Unlock Protocol.

Governance happens at multiple levels, and the [Unlock DAO](../../governance/unlock-dao/) is encouraged to create their own decision-making processes. Currently, onchain governance through the DAO contract and non-binding off-chain governance through forum discussions and Snapshots are being used. Collaborative work is encouraged through the Unlock [DAO Culture guide](https://opensea.io/assets/base/0xb6bd8fc42df6153f79eea941a2b4c86f8e5f7b1d/5084) and via the [Unlock DAO Charmverse space](https://app.charmverse.io/join?domain=unlock-dao).

The [Unlock DAO](../../governance/unlock-dao/) has full control over the tokens in its treasury, and Unlock Labs does not have a mechanism to bypass the governance process.

Unlock Labs, despite being the original core creators and maintainers of the protocol, does not have more "power" than the [Unlock DAO](../../governance/unlock-dao/) to control the protocol and its smart contracts. Unlock Labs reserves the right to act in alignment with its goal of Unlock Protocol being decentralized to remain compliant with regulations.

### Overview and tokenomics

As noted above, [UP](../../governance/unlock-dao-tokens/) is the native governance token of Unlock Protocol. It is deployed on Base.

[UP](../../governance/unlock-dao-tokens/) can be delegated to vote on proposals governing the Unlock Protocol.

Developer rewards of UP are calculated using a logarithmic curve based on the gas consumed by a purchase transaction and the actual value added to the protocol’s Gross Network Product (GNP) during each key purchase. UP also may be earned through other mechanisms, such as grants from the Unlock DAO treasury.

UP has a fixed supply of 1,000,000,000 tokens on Base.

### Proposals

Proposals are onchain-executable transactions. As code, a proposal can only trigger onchain actions. For example, a proposal could be _"The [Unlock DAO](../../governance/unlock-dao/) pays x tokens to example.eth"_ or _"Change parameter p of this smart contract to be k."_

A proposal cannot be _"The Unlock Labs team needs to travel to conference y,"_ or _"John Doe needs to purchase UP tokens on the Coinbase exchange,”_ since these proposals would require off-chain actions that are not governable or executable by code.

Proposals start as discussions and conversations. These conversations can be initiated by any community member through public forums visible by all token holders.

### Voting

Voting for the [Unlock DAO](../../governance/unlock-dao/) happens onchain through the governor contract. To send transactions, delegates can use any front-end application that supports the OpenZeppelin Governor contracts, such as [Tally](https://www.tally.xyz/gov/unlock-protocol/).

Voting on a proposal is only available to delegates with the balance of tokens they held at the time of the proposal’s submission.

### Implementation of proposals

Proposals are discussed amongst community members with the intention of making voting straightforward by increasing awareness.

Once a relative consensus has been reached through conversation, a community member can submit a formal proposal for votes in the form of executable code. After submission, every delegate can vote in favor of or against the proposal during a multi-day voting period.

A proposal will be executed if a quorum of votes has been reached and the proposal is approved by a majority.

The execution of an approved proposal occurs after a multi-day time lock, during which token holders who disagree with the change have the opportunity to sell their stake.

## Appendix: Convenience layer applications

Unlock Labs creates and maintains a number of front-end applications that simplify usage of Unlock Protocol, especially for new and non-technical users of the protocol. These applications are provided as a convenience, and their usage is optional.

All functions implemented through these convenience applications could be natively implemented by developers building solutions with Unlock Protocol; their functions can be integrated seamlessly into your applications directly without using these convenience applications themselves.

Current convenience applications include the Creator Dashboard, the Member Keychain, and Unlock Accounts.

- [**Creator Dashboard**](https://app.unlock-protocol.com/dashboard) — The Creator Dashboard is a no-code application through which anyone can deploy or update locks, view key owners, and withdraw funds generated from keys sold from locks. The Creator Dashboard is free to use.
- [**Member Keychain**](https://app.unlock-protocol.com/keychain) — The Member Keychain allows members to view all of their keys and use them. With the Member Keychain, members can cancel or transfer memberships, or generate QR codes to assert ownership. Like the Creator Dashboard, the Member Keychain is free-to-use.
- [**Unlock Accounts**](/tools/sign-in-with-ethereum/unlock-accounts) — Unlock Accounts enable consumers without a cryptographic wallet to purchase keys with a credit card. Ownership of keys is verified by using an email address and a password. A fee is paid by the key purchaser to Unlock Labs to cover Stripe transaction fees, gas costs, and other costs associated with creating and maintaining wallets on behalf of consumers.

## Glossary

Definitions of terms used in this document.

- **Convenience application:** An application developed by Unlock Labs to give end-user access to underlying capabilities of Unlock Protocol

- **ERC-20:** A fungible token that uses the ERC-20 token standard specified at [https://ethereum.org/en/developers/docs/standards/tokens/erc-20/](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)

- **ERC-721:** A non-fungible token that uses the ERC-721 token standard specified at [https://ethereum.org/en/developers/docs/standards/tokens/erc-721/](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/)

- **ERC-1155:** A token that uses the ERC-1155 multi-token standard specified at [https://ethereum.org/en/developers/docs/standards/tokens/erc-1155/](https://ethereum.org/en/developers/docs/standards/tokens/erc-1155/)

- **Gross Network Product (GNP):** The total value exchanged using Unlock Protocol, as measured by the total aggregate value of all keys that have been minted using the protocol

- **Governance token:** A token that grants its bearer the ability to create or vote on governance proposals in a decentralized organization

- **Key:** A membership NFT that has been minted by Unlock Protocol’s PublicLock contract

- **Lock:** A smart contract that uses Unlock Protocol’s PublicLock template that can mint keys and token gate member access to resources

- **Minting:** The process or act of creating an NFT

- **NFT:** A non-fungible token

- **PublicLock:** An Unlock Protocol smart contract (**PublicLock.sol)** that mints and manages membership NFT keys and can restrict access to resources based on the user's possession (or lack of possession) of a specific membership NFT key

- **UDT:** See _Unlock Discount Token_

- **UP:** See _Unlock Protocol Token_

- **Unlock (smart contract):** An Unlock Protocol factory contract (**Unlock.sol**) that deploys locks and accounts for Unlock Protocol Token (UP) rewards

- **[Unlock DAO:](../../governance/unlock-dao/)** A decentralized organization of token holders who govern and control Unlock Protocol

- **Unlock Discount Token:** Unlock Protocol’s deprecated governance token on Ethereum mainnet, also referred to as UDT, and replaced by UP (the Unlock Protocol Token) on Base

- **[Unlock Protocol Token:](../../governance/unlock-dao-tokens/)** Unlock Protocol's current governance token on Base, alse referred to as UP

- **Unlock Ecosystem:** A community of creators, distributors, and consumers who share ownership of Unlock Protocol through their contributions using the protocol

- **Unlock Labs:** The core team that created and currently maintains Unlock Protocol

- **Unlock Protocol:** A suite of upgradable smart contracts that create memberships as NFTs

- **Unlock Tools**: Front-end convenience applications built by Unlock Labs to further sustainable innovation on Unlock Protocol
