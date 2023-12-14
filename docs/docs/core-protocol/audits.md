---
title: Unlock Protocol Smart Contract Audits
description: >-
  Our contracts have been audited to increase our confidence that they work as
  expected.
---

# Audits

As of March 2022, our smart contracts have been audited by 3 different teams.

Here are the results:

| Akira Tech                                                                               | ByteRocket                                                                                   | Code4rena                                                                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| <a target="\_blank" href="/img/audits/akira.pdf"><img src="/img/audits/Akira.png" /></a> | <a target="\_blank" href="/img/audits/byterocket.pdf"><img src="/img/audits/Byte.png" /></a> | <a target="\_blank" href="/img/audits/code4rena.pdf"><img src="/img/audits/code4rena.png" /></a> |

We are pleased with the results of these audits as they have identified **no issue that would jeopardize creators or members' funds systemically**. The audits did identify improvements that we have (or will) implement to simplify flows, make risky behaviors less error-prone, and optimize for reduced gas consumption.

To complement our disclosure of the full reports, here is a summary of the most significant issues that were identified and how we have addressed or are addressing them.

### A malicious miner can mint larger than expected UDT

This issue is by far the most significant one that was identified, as it could create an issue with the UDT supply. _We have now implemented a mechanism to prevent it._

The amount of tokens minted on every transaction is based on the gas spent by the person submitting a transaction [more info](../governance/unlock-dao-tokens.mdx#earning-udt). A malicious miner could set a very high gas price for a transaction where they would purchase an expensive membership on a lock for which they are the beneficiary. By doing so, they would not actually spend any real funds but would be able to earn a large amount of UDT.

We implement a preventative measure by not using the gas price submitted by the transaction sender, but by instead using the blockchain’s current `baseFee`. This value itself cannot be manipulated by miners and is computed based on transactions in the previous blocks, rendering this vulnerability no-op.

### Key transfers are unsafe when a key has a manager

Once a key has a manager (see [roles](./public-lock/access-control.md)), if it is transferred, the key manager is not reset. This creates a risk where a malicious user could sell keys for which they retain the key manager role and transfer back the key to themself after the sale.

This risk is real on the secondary markets. We’re currently evaluating possible mitigation steps. At this point, we believe the best way to mitigate this is by revealing the key manager on the front-end, to indicate to a user that a key they are purchasing on a secondary market could indeed be recaptured.

Additionally, we identified that key transfers are currently not canceling any previously approved transfer, which could result in a key being transferred “again” if an approval existed before.&#x20;

### Free trials are risky.

The idea of a free trial is that a lock manager can accept a request from a key owner to refund the total amount of the key. Free trials on locks are disabled by default but can be enabled by lock managers.

This mechanism can be abused in several ways:

- The same person can create multiple addresses and claim free trials for each of them by canceling their membership before the end of the free-trial period. We believe this is in line with how “free trials” work in most systems that implement them. We recommend creators who want to enable these free trials to consider a mechanism for Sybil resistance -- using our hook for cancellations, for example.
- An attacker could purchase a key, transfer time short of the free trial to a 3rd party address A, and then cancel to get the full refund. By repeating this process multiple times, address A could end up owning a “full” key that could be canceled to get a refund of the full price. Even though this attack is valid, we believe it is a risk _only_ when free trials are enabled. In order to mitigate further, we will implement a transfer hook that should be used on locks that enable free trials and for which the lock should prevent refunds from anyone who has transferred the key.

### Compromised Unlock could break all locks

All locks “callback” to Unlock upon key purchase. That is the mechanism used to mint UDT and account for GDP. We implemented locks so that even if that callback fails, the lock is successfully able to mint a new key and assign it to the purchaser. However, we did not account for the gas limit. If the callback were to spend too much gas the whole transaction would fail. We have introduced a mechanism to cap the amount of gas that can be spent in the recordKeyPurchase function as a way to ensure that the key purchases can never fail because of a malfunction inside the Unlock contract.

### Other issues

- **Oracle Manipulation**: The Unlock contract uses the Uniswap v2 oracle and updates only once per day. In case of discrepancy between the measured exchange rate and the actual exchange rate, a malicious user could arbitrage by earning UDT and selling them on the exchange. We will replace our v2 Oracles for Uniswap v3, which provide more “realtime” price information.
- **Buggy/malicious ERC20 contracts**: It was noted that if a lock uses a buggy/malicious ERC20 contract then the behavior of the protocol is altered. That would be the case only if said ERC20 contract was approved to be used for GDP calculation by the DAO. We have been very conservative when it comes to _approved_ ERC20. We will urge the DAO to be extremely careful when adding more ERC20 tokens for GDP calculation.
- **Refunds are not guaranteed**: A malicious lock manager could withdraw all funds and prevent refunds (they could also disable them). Conversely, if the price on a lock went up, the refund that a user could get is based on the new price vs. the price they paid. We will introduce a mechanism to keep track of the price paid.
- **`ShareKey` denial of service**: it is possible to prevent key sales on a lock by sharing 1 single key with multiple addresses (as many as the token supply limit). The lock manager can easily increase supply and (soon) delete existing keys, so we don’t think this represents a likely or high-impact attack. The lock manager could also prevent transfers and key sharing.
- **LockTemplates** validation: we will add measures to check versions submitted more thoroughly as ways to prevent “user” error in the DAO.

### Required smart contract changes

- Cap gas on `recordKeyPurchase` ✅
- use `baseFee` ✅
- `onTransfer` hook ✅
- Alter transfer to prevent malicious key manager attack ✅
- Uniswap v3 oracles ✅
- Reset approvals on key transfers ✅ (ie if someone transfers a key we need to make sure that all approvals for that key are reset)
- Use renewal snapshot to determine refund ⏰
- Gas savings ⏰
