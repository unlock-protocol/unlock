---
title: Entities
description: List of Entities
---


# Entities

- [`Lock`](#lock)
- [`Key`](#key)
- [`UnlockDailyData`](#unlockdailydata)
- [`LockStats`](#lockstats)

# Lock

Description: get specific details of the lock

| Field              | Type          | Description     |
| ------------------ | ------------- | ----------------------------------------|
| id                 | ID            | Unique ID for the Lock object (uses the lock address). |
| address            | Bytes         | Address of the lock. |
| name               | String        | A descriptive name for a collection of NFTs in this contract. |
| symbol             | String        | Token symbol. |
| expirationDuration | BigInt        | Duration is set on the lock when you deploy and the expiration which is set on each key when they are minted. |
| tokenAddress       | Bytes         | Address of the 'currency' ERC20 contract if the keys are priced using an ERC20.|
| price              | BigInt        | Price of the keys sold the lock.|
| lockManagers       | [Bytes]       | An assigned role set on a Lock contract which gives the highest level of permissions to the wallet address set to that role. |
| version            | BigInt        | Unlock Protocol version of a "minting contract". |
| totalKeys          | BigInt        | The number of keys owned by keyOwner (expired or not). |
| maxNumberOfKeys    | BigInt        | Maximum number of keys for sale. |
| mayKeyPerAddress   | BigInt        | The maximum number of keys allowed for a single address. |
| keys               | [`Key`](#key) | Refer to key entity. |
| createdAtBlock     | BigInt        | Which block the lock was created. |
| lastKeyMintedAt    | BigInt        | The timestamp of the block in which the last key was minted. |

# Key

Description: get specific details of the Key

| Field          | Type    | Description       |
| -------------- | ------- | ------------------------------------- |
| id             | ID      | Unique identifier for a key (combination of lock address and token id.) |
| lock           | Lock    | In the Unlock ecosystem, a “Lock” is a smart contract that creates (or “mints”) NFTs. |
| tokenId        | BigInt  | TokenId for a given key. |
| owner          | Bytes   | The address of the key owner. |
| manager        | Bytes   | An assigned title set on an Unlock key which gives a specific wallet address authorization to transfer, share or cancel. |
| expiration     | BigInt  | Time the key expires. |
| tokenURI       | String  | The tokenURI on an NFT is a unique identifier. |
| createdAtBlock | BigInt  | Block key was created. |
| cancelled      | Boolean | Invoked by a Lock manager to expire the user's key and perform a refund and cancellation. |

# UnlockDailyData

Description: get specific details of the Daily Data Unlock

| Field               | Type     | Description                  |
| ------------------- | -------- | ---------------------------- |
| id                  | ID       | Day id based on number of days since in Unix Epoch. |
| lockDeployed        | BigInt   | Number of locks deployed on that day. |
| keysSold            | BigInt   | Daily number of keys sold. |
| activeLocks         | [Bytes]  | Daily number of active locks. |
| grossNetworkProduct | BigInt   | Total value exchanged on the network. |

# LockStats

Description: get specific details of LockStats

| Field              | Type    | Description          |
| ------------------ | ------- | -------------------- |
| id                 | ID      | Transaction hash. |
| totalLocksDeployed | BigInt  | Total number of locks deployed. |
| totalKeysSold      | BigInt  | Total number of keys sold. |
