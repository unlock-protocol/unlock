---
title: Renewals
description: One of the unique characteristics of the Unlock Protocol is that it can create NFTs that have expiration dates. Once expired, these NFTs can be renewed, or extended, providing the ability to do subscriptions!
sidebar_position: 3
---

Once [minted](./minting-keys.md), an expiration is set _onchain_ for any key. The expiration is a timestamp which can be retrieved for any individual key by using the [`keyExpirationTimestampFor`](/core-protocol/smart-contracts-api/PublicLock#keyexpirationtimestampfor) method.

Once expired, a key is not considered valid anymore, and functions like `balanceOf` will not return a key that can be renewed, and its expiration extended.

An **expired key can be renewed**. When it is renewed, the key's expiration date is extended so the key is considered valid for a longer duration.

:::info
No new keys or membership tokens are created upon renewals.
:::

For renewals and extensions, each NFT needs to be extended individually. However, they can be extended using different methods:

- [`extend`](/core-protocol/smart-contracts-api/PublicLock#extend) where the sender of the transaction _pays_ for the extension, even if they are not the owner of the NFT itself.
- [`renewMembershipFor`](/core-protocol/smart-contracts-api/PublicLock#renewmembershipfor) which can only be called for ERC20 locks where the owner has approved the renewals through an ERC20 approval as _their_ balance will be reduced.
- [`grantKeyExtension`](/core-protocol/smart-contracts-api/PublicLock#grantkeyextension) which is similar to `grantKeys` and can only be called by lock managers or key granters.

## Automated renewals

The `renewMembershipFor` function enables automated renewals! In practice, _anyone_ can call this function on an expired membership NFT, provided that the current owner of said NFT has approved a large enough amount of ERC20 to be spent for the renewal to succeed. The contracts also include a function [`isRenewable`](/core-protocol/smart-contracts-api/PublicLock#isrenewable) that can be used to check if a given membership can be renewed. This function reverts with an explanation about why a given membership cannot be renewed if it is indeed not renewable.

Unlock Labs has built scripts that will automatically renew expired keys on all the [supported networks](../unlock/networks.mdx).
