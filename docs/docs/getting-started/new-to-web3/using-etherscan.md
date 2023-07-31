---
title: Using Etherscan
description:
  In this guide, we will show you how to use Etherscan. We will cover everything from viewing transactions and addresses to creating tokens and smart contracts. 
---
# Using Etherscan

Etherscan is a block explorer that allows users to search the Ethereum blockchain for wallet addresses, transactions, smart contracts and tokens. It also provides an API for developers to interact with the Ethereum blockchain. This guide will show you how to use Etherscan to view information about your Ethereum wallet address, transactions, smart contracts and tokens.

## Find Your Wallet
To get started, go to [etherscan.io](https://etherscan.io) and enter your Ethereum address in the search bar bringing up your account page, which contains information about your balance, transaction history, and tokens.

![searchbar](/img/basics/etherscan-searchbar-screenshot.png 'searchbar screenshot')

## Viewing Transactions
You can also view your transaction history on the blockchain by clicking on the "Transactions" tab.

![transactions tab](/img/basics/etherscan-transaction-tab-screenshot.png 'transactions tab screenshot')

## Token Information
Next, let's look at how to use Etherscan to view information about a token. You can search for a token address in the same searchbar you used for a wallet address at the top of the homepage. This will bring up the token's page, which contains information about its total supply, price, volume, supply and holders.

![token page screenshot](/img/basics/etherscan-token-page-screenshot.png 'token page screenshot')

At the bottom of the screen you have tabs available for viewing transfers, holders, info, exchanges, dex trades, the contract, analytics and comments.

![token page bottom screenshot](/img/basics/etherscan-token-page-bottom.png 'token page bottom half screenshot')

## Smart Contracts
Using the same search bar you used before to pull up wallet and token information enter the contract address you're interested in. Once you've found it, click on the "Contract" tab. This will bring up the contract's address, ABI, and source code.

![contract tab screenshot](/img/basics/etherscan-contract-tab.png 'contract page contract tab screenshot')

### Source Code
Source code of smart contracts is only viewable here if it's been verified. Verified contracts can be both read and interacted with. You'll find a few handy tools for finding things in the source code here including the ability to search and an outline to help you quickly read through the list of functions and jump quickly to one you're interested in.

![contract page source code screenshot](/img/basics/etherscan-contract-page-source-code.png 'contract page source code screenshot')

### Reading Contracts
Despite the name the "Read Contract" tab is not synonymous with viewing the source code. Instead this is the place you can view real-time information about a contract. What shows up here will be entirely dependent on the contract itself. Some common things you'll see might be members or balances.


### Interacting with Smart Contracts
In order to actually interact with the contract you'll need to be logged in with your web3 wallet.

![contract page write contract screenshot](/img/basics/etherscan-contract-page-write.png 'contract page write contract')

The functions that are available to you will be dependent on the contract itself and the permissions your wallet address has for executing those functions. Expand the function you're interested in and you'll see the available inputs and a "write" button to execute it.

![contract page write contract functions screenshot](/img/basics/etherscan-write-contract-functions.png 'contract page write contract functions screenshot')

## Etherscan API
Etherscan has a rich API which can be found at [docs.etherscan.io](https://docs.etherscan.io/) and for most basic needs this might work just fine. However this API also comes with no warranties, does require attribution if used and isn't the best solution for building robust dApps. It's most commonly used for gas price lookups or basic stats. If you do plan to use it for building more than that then you should checkout their [pro version](https://docs.etherscan.io/api-pro/etherscan-api-prohttps://docs.etherscan.io/api-pro/etherscan-api-pro) which has additional endpoints available, higher rate limits and better support.
