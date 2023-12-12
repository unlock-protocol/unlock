---
title: Migrating the UDT Uniswap Pool to Uniswap v3
authorName: Clément Renaud
publishDate: December 7, 2023
description: Transferring the existing UDT/WETH liquidity provision by the DAO's treasury in Uniswap V2 to the existing Uniswap V3 pool
image: /images/blog/uniswap-migration.png
---

We are introducing a new proposal to migrate the liquidity provided by the Unlock DAO’s treasury from Uniswap V2 to Uniswap V3. This migration should provide more efficient trading and routing capabilities.

The process will be split in two proposals. The first proposal is to initially transfer 10% of the existing V2 liquidity position to ensure the integrity of the migration process. Pending a successful migration of the first 10% of the position, a second proposal will follow to migrate the remaining 90% of the initial V2 position. This is done to reduce fluctuations in UDT price during and after the migration process and ensure a smooth transition.

## **Why the migration?**

Uniswap allows token holders to trade pairs and to exchange one token for another. Today, the UDT / WETH pair on mainnet primarily uses Uniswap V2, while the newer [Uniswap V3 pool](https://etherscan.io/address/0x22a0738bDe54050FfC04408063Fd5FbDc1205BDf) has very little liquidity.

Using Uniswap V3 allows more efficient trading and routing, making it easier to trade UDT for any other tokens available. Therefore, we propose that the DAO migrate most of liquidity from the existing V2 pool to the V3 pool.

## **Uniswap V2 vs V3**

The main difference between Uniswap V2 and V3 pools is the way liquidity is concentrated. In Uniswap v2, liquidity is evenly distributed across the entire price range while in [Uniswap v3](https://blog.uniswap.org/uniswap-v3), liquidity can be concentrated in specific price ranges, allowing for more efficient trading.

## Mechanism to m**igrate the Uniswap pool**

For the migration, Uniswap provides a contract called [V3Migrator](https://docs.uniswap.org/contracts/v3/reference/periphery/interfaces/IV3Migrator) to enable liquidity transfers. This contract will remove the liquidity from the existing V2 pools, execute the required allowance settings and token transfers to the new V3 pool, then mint a new position.

Uniswap maintains a deployed [version on mainnet](https://etherscan.io/address/0xA5644E29708357803b5A882D272c41cC0dF92B34) that can be used directly.

## **The Unlock DAO proposal(s)**

The current liquidity pool provision in the Unlock DAO's treasury on V2 pool contains approximately 5066.32 UDT and 30.96 WETH. This is a proposal to transfer the WETH and UDT tokens held by the DAO into the newer v3 pool in order to provide liquidity there.

The migration will be split in two separate proposals: first a migration of 10% of the existing position, then the remaining 90%. This is to make sure that everything works as expected.

Both proposals follow a similar pattern in two steps:

1. Set approval on the V2 pool to allow the Uniswap migrator contract to manipulate the existing position

and

2. Call the `migrator.migrate` function to carry out the migration

Once the call is executed, the V3 position will have been created and the Unlock DAO (timelock) address will receive a NFT representing it.

The code of the proposal is visible in the https://github.com/unlock-protocol/unlock/pull/13076.

## **Potential risks and challenges**

During the migration phase, users might experience a temporary reduction in liquidity and change in price. By splitting the liquidity transfer in two, we aim at reducing the potential change in UDT price that may occur.

All along the migration process, observers can monitor that all positions are transferred correctly and that UDT swaps can resume using Uniswap V3.
