---
title: Member Wall
subTitle: Showing a list of members has never been easier!
authorName: Julien Genestoux
publishDate: November 12, 2019
description: Showing a list of members has never been easier!
image: https://member-wall.unlock-protocol.com/api/members?network=137&locks=0xb77030a7e47a5eb942a4748000125e70be598632&maxWidth=1000
---

The Unlock team spent the week-end in Waterloo, Canada [hacking on Ethereum](https://unlock-protocol.com/blog/ethwaterloo-tickets/).

I worked on building a "member wall", which is just a way to show the list of members for any given lock, as an image.

# What does it really do?

It's a very simple application which generates a large SVG image which lists all members of a key. For example, here is the list of [participants to the EthWaterloo hackathon](https://member-wall.unlock-protocol.com/api/members?locks=0xb0ad425ca5792dd4c4af9177c636e5b0e6c317bf&maxHeight=300), or the list of people who supported Evan Van Ness' [Week In Ethereum anniversary edition](https://member-wall.unlock-protocol.com/api/members?locks=0x79C91241eFf1F119CDf743730f6e6fB2aF7Fb279&maxHeight=300)!

The great thing about using images is that they can be embedded on almost any webpage. For example, below is the list of all members to our lock and that image is dynamically refreshed when new members are added!

<object data="https://member-wall.unlock-protocol.com/api/members?network=137&locks=0xb77030a7e47a5eb942a4748000125e70be598632&maxHeight=300" type="image/svg+xml"/>

Each of the members is clickable and will link to the corresponding page on [Etherscan](https://etherscan.io/)!

# How does it work?

Member Wall is a serverless application running a [NextJS](https://nextjs.org/) application on [Zeit](https://zeit.co/)'s infrastructure.

For each query, the application gets the list of members for one or more locks, by using [the Unlock Graph Protocol sub-graph](https://thegraph.com/explorer/subgraph/unlock-protocol/unlock).

From there, we use [React](https://reactjs.org/) to generate a SVG image. This image is made of individual SVG images for each icon which reproduce [MetaMask](https://metamask.io/)'s Jazzicons.

The wall's size is "fixed" but can be customized and the size of each member is based on the number of members. Here's the list of our blog's members on a 30px height!

![Members](https://member-wall.unlock-protocol.com/api/members?network=137&locks=0xb77030a7e47a5eb942a4748000125e70be598632&maxHeight=30)

Of couse, this is all [completely open source](https://github.com/unlock-protocol/member-wall), so you could easily run that on your own server, or maybe even host it on IPFS?

# Embedding!

One of the benfits of decoupling the membership from the platform itself means that this can actually be embedded on any website. For example, we added this list of members to [our Github page](https://github.com/unlock-protocol/unlock/), so that everyone who makes a donation is instantly shown on the README, as soon as the transaction gets mined!

Where would you embed your members wall?
