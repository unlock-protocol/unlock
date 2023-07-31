---
title: What is a crypto wallet?
sidebar_position: 2
description: >-
  An overview for developers to understand crypto wallets (aka, web3 wallets)
  and how they’re connected to cryptocurrencies, NFTs, Dapps, and Smart
  Contracts.
---

# What is a crypto wallet?

## Introduction

_What is a crypto wallet and why are they important, from a developer’s perspective?_

The world of web3 can be confusing with jargon, buzzwords, and new terms often used. In this tutorial, we will explain crypto wallets and explore a few other concepts and terms that are critical to understanding wallets.

At the conclusion of this tutorial, we hope you’ll have a better understanding of cryptocurrencies, NFTs, decentralized apps (Dapps), smart contracts, and how crypto wallets connect them all together.&#x20;

We will also show you a path to create your first crypto wallet, change fiat money to cryptocurrency through a crypto exchange, and transfer your cryptocurrency from an exchange to your own crypto wallet for safekeeping.

## What is a crypto wallet?

Upon hearing the word “wallet”, we may think of the pocket or purse accessories that hold physical items like our cash, IDs, and credit or debit cards. Crypto wallets are similar, except they hold _digital_ items, or tokens, including:

1. Cryptocurrency like Bitcoin, Ether, or Dogecoin, that can be used as money (Fungible Tokens).
2. Non-Fungible Tokens (NFTs) - these are digital tokens associated with tangible assets and/or intangible utility. For example, Nike is experimenting with NFTs that are linked to the ownership of physical shoes. They can also represent intangible utility, like community membership, software licenses, or storage space on a cloud server.&#x20;

> **Did you know?**
>
> Most crypto tokens utilize Blockchain technology. Bitcoin was the first application of the blockchain. It mainly used blockchain technology for payments and transfers of a single digital currency: bitcoin (note the lowercase b, used to designate the currency, and uppercase for the network), and wasn’t made for running code applications (Smart Contracts or Dapps, as they are also called).
>
> The Ethereum blockchain was created in 2015 by Vitalik Buterin to let anyone “write smart contracts and decentralized applications (Dapps)” that run on a single supercomputer made up of thousands of decentralized computers.&#x20;

To summarize, a crypto wallet is a tool for storing various digital assets like cryptocurrencies and NFTs. Your wallet is a tool for connecting to web3, authenticating yourself, and authorizing transactions on the blockchain.

> **Fungible vs. Non-Fungible**\
> The word “fungible” is used to refer to things that can be exchanged for other things of exactly the same kind. \
> For example, the U.S. dollar is fungible. You can exchange a $100 bill with a friend, and each of you will still have the exact same spending power. Most cryptocurrencies are fungible, too — a bitcoin is a bitcoin, and it generally\* doesn’t really matter which bitcoin you have. (\*in some cases, such as stolen coins, identification of a specific bitcoin can be relevant when trying to trace the path of a stolen asset).
>
> NFTs on the other hand, like most things in the physical world, such as cars and houses, are considered non-fungible. They have unique qualities, and you can’t just exchange them for others of the same type. You can swap your 2022 Tesla with your friend’s 2022 Tesla, but the cars wouldn’t exactly be the same.

In addition to **storing** cryptocurrency and NFTs, crypto wallets allow people using the internet (web3) to connect to Dapps, by securely authenticating the user using their private key.

Let’s talk about Dapps before we get into the details of how crypto wallets work...

### Crypto wallets, Dapps, and Smart Contracts

Decentralized Applications, or "Dapps"\*, are conceptually the same as the apps or games you develop for and/or use on your computer or phone today. Just like those apps, Dapps have a backend and a frontend. The key difference, however is that the backend code of these apps (called Smart Contracts) run on a network of computers powered by decentralized protocols such as Ethereum, instead of centralized servers like those on which the apps on our phones are running).

\*You'll also see "Dapps" and "dApps" around the web; we've chosen to use Dapps to abbreviate.

#### Smart Contracts are the backend of Dapps

A smart contract is code that lives on the blockchain and provides a set of rules that run exactly as programmed. A Dapp is an application built on a decentralized network using a blockchain (such as Ethereum, Polygon, or Tezos) for data storage, smart contracts for their app logic, and a frontend user interface.

Prefer listening and watching over reading? → Here are a few explainer videos from Whiteboard Crypto that we’ve found to be great resources:

- [**What are dApps**](https://www.youtube.com/watch?v=oPIupbsVimc&t=186s)**?**
- [**What are Smart Contracts in Crypto**](https://www.youtube.com/watch?v=pyaIppMhuic)**?**

**Now that we have a basic understanding of smart contracts and Dapps, let’s see how they enable crypto wallets to work...**

## How do Crypto Wallets work?

As the name suggests, cryptocurrency is based upon encryption technologies, which use a combination of keys. These currencies are secured through the use of private keys. These private keys can be stored in a number of different ways, in different types of crypto wallets.

Unlike traditional wallets though, crypto wallets don’t actually store funds. Instead, they store two keys: a public one to identify the block of tokens, and a private one to access them.

- **Public Key**: A Public Key links to an address that lets you send and receive transactions. You can think of the public key as your email address or your bank account number.
- **Private Key**: A private key proves that you own the tokens associated with your public address. You can think of the private key as your email password or the password you use to login to your banking account. **You must keep your Private Key **_**private**_** — do not share it with anyone.** Since a private key is hard to remember (it’s a very long string of random numbers), a crypto wallet comes with a 12-24 word "secret phrase" or "seed phrase", which functions as a backup password. It’s important to hide these in a safe, secure place, ideally by holding parts of the phrase in different locations.

**Remember, you **_**can share your public key**_** with others to send and receive transactions, but you must **_**never**_\*\* **\_**share**\_** **\_**your private key or seed phrase**\_** with anyone.\*\* If you share your private key, you are essentially handing over control of your wallet and all of its assets. Also, no company or individual should ever ask for your seed phrase — anyone who does is very likely a scammer attempting to steal your funds.

## Types of crypto wallets: hot and cold

There are two primary categories of crypto wallets: hot wallets and cold wallets. \
The main difference between hot and cold wallets is whether they are connected to the Internet. Hot wallets are connected to the Internet, while cold wallets are kept offline.

#### Hot Wallets (Software)

Hot wallets can take different forms. You may access one through the crypto exchange you use to buy your coins, download a software program to your computer desktop, or even use a smartphone app. Let's explore these options.

**A) Custodial Hot Wallets: storing your keys on the exchange**

The easiest way to store cryptocurrency is to do so on the exchange where you purchase the currency. Many crypto exchanges like [Coinbase](https://www.coinbase.com/), [Gemini](https://www.gemini.com/), [Binance](https://www.binance.com/), [Kraken](https://www.kraken.com/) allow you to store your cryptocurrency on their exchange itself. However, to buy (or otherwise hold) NFTs, you’ll often use a non-custodial wallet, like MetaMask. With these types of wallets, you always retain ownership and control of your private keys. More on this later.

The terms "Hosted or Custodial Wallet" are used because in these cases the exchange holds on to your private key for you. As a user you do not have access to your private key, or in some cases you're never even assigned a private key, because the exchange keeps track of its own internal ledger. This means you need to trust the company to keep it safe, just like you would need to trust any online company with your data. This is something to consider when deciding what and how much you store on the exchange itself.

Storing the currency on the exchange can be convenient, especially if you're getting started, but it's not ideal to do so long-term for two reasons:

1. The first problem with leaving your assets in an exchange on a long-term basis is that these companies are in control of your cryptocurrencies. You're not in full control of the token, and the private keys needed to sign the transactions. If you lose access to these exchanges for whatever reason, you lose your crypto, forever. There's no way to recover.
2. They're generally not considered the most secure place to store your valuable cache of digital tokens, since cryptocurrency exchanges are a notable, semi-centralized target for hackers.

So, it is highly recommended to ultimately transfer funds to a wallet where you are responsible for securing, backing-up and managing your own funds.

**B) Non-Custodial Hot Wallets: storing your keys on a desktop/mobile wallet**

It's a good idea to eventually move your crypto onto your own form of storage, also known as non-custodial wallets. When you move your crypto to a non-custodial wallet (like MetaMask, Rainbow Wallet, Coinbase Wallet, Trust Wallet, etc.), you hold the keys to your wallet.

The main difference between custodial wallets and non-custodial wallets is that with non-custodial wallets, users are in full control of their tokens, and the private keys needed to sign for transactions are held by the individual, not the exchange.

When creating a non-custodial wallet, like MetaMask, you will be asked to write down and safely store a list of 12 randomly generated words, known as a “recovery,” “seed,” or “mnemonic” phrase. From this phrase, all of your public and private keys can be generated. This acts as a backup or a recovery mechanism in case you lose access to your device.

#### Setting up a Hot Wallet using MetaMask (desktop and mobile)

1. Create a new wallet using Metamask (you can also [import an existing wallet](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account) into Metamask)
   1. See [Metamask’s “Getting Started” documentation](https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-started-with-MetaMask).
   2. Install MetaMask for your web browser.
   3. Click on the MetaMask icon and click Get Started.
   4. Select “Create a Wallet.”
   5. Create a password for MetaMask.
   6. Write down your seed phrase and store it somewhere secure.
2. \[Optional] You can also access your wallet from a mobile device using the MetaMask mobile app or another mobile wallet app (eg, [Rainbow](https://rainbow.me/) is another popular mobile wallet).
   1. MetaMask has apps for both iOS and Android mobile platforms
   2. Download the MetaMask app from the [Apple App Store](https://apps.apple.com/us/app/metamask/id1438144202) or the [Google Play Store](https://play.google.com/store/apps/details?id=io.metamask)
   3. Open the MetaMask mobile app and select 'Sync or Import' > 'Scan QR code'.
   4. Log into your MetaMask extension.
   5. Click Settings > Advanced > Sync with Mobile. You'll see a QR code.
   6. Scan this QR code with your MetaMask mobile app (see step #2).

#### Hardware/Cold Wallet

Cold wallets are hardware devices that are not connected to the internet and therefore are more secure. They're external devices that store your keys, and they look similar to a USB drive. Because they’re offline, hardware wallets are the most difficult type of wallet to hack. You can only sign a transaction by pushing a physical button on the device, which malicious actors cannot control unless they gain physical possession of your device.

#### **Choosing a Hot vs a Cold Wallet**

Both hot and cold wallets store your private keys, which are what give you (or someone else) access to your cryptocurrencies and NFTs. If someone gets ahold of your private keys, they can steal whatever's in your wallet. A cold wallet reduces those risks, since your private keys are stored offline in the wallet.

For small amounts of crypto, a cold wallet isn't necessary. For example, spending $100 on a cold wallet to store $100 of crypto may not be worth it. For bigger amounts though, it’s a good idea to move your funds to a cold wallet.

As a rule of thumb, you should use a cold wallet when you have more crypto than you'd be comfortable losing.

The most popular hardware wallets are [Ledger](https://www.ledger.com/) and [Trezor](https://trezor.io/) — each of which have their strengths and limitations relative to one another. When choosing a hardware wallet, it’s important to make sure the wallet supports the blockchain (and its tokens) that you plan to secure with it.

**Buying Hardware wallets**

You should always buy hardware wallets new and directly from the manufacturer or a licensed distributor. There are fake hardware wallets in circulation which may steal your crypto, so be aware and shop cautiously. **Never buy a **_**used**_** hardware wallet** — there's no telling what a previous owner could've done to a device or whether the product is actually genuine.

In some contexts, "hardware wallet" may also refer to paper wallets — wherein you print information about your public and private keys onto a sheet of paper.

## Resources and Further Reading

Hopefully this was a helpful introduction to crypto wallets and how they allow you to store and access cryptocurrencies, NFTs, and Dapps. We’ll leave you with a few additional resources that you can use to continue learning and exploring the world of web3.

- [Using Unlock Protocol for memberships as NFTs](https://docs.unlock-protocol.com/unlock/)
- [Introduction to Dapps](https://ethereum.org/en/developers/docs/dapps/) ([ethereum.org](http://ethereum.org))
