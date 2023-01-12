---
title: UDT Vulnerability Disclosure
subTitle: Last week, we identified a serious vulnerability in the UDT contract. It is now fixed and has not been exploited.
authorName: Julien Genestoux
description: While working on debugging a signature issue in the UDT contract, we identified a critical vulnerability. This vulnerability was introduced in a UDT contract upgrade on August 2nd 2021 and discovered on October 14th around 1045AM ET. A patch was successfully deployed on the same day at about 1PM ET. The vulnerability was not exploited.
image: https://unlock-protocol.com/images/blog/emergency-upgrade-1-3/code_vulnerability.jpg
publishDate: October 18, 2021
---

While working on debugging a signature issue in the UDT contract, we identified a critical vulnerability. This vulnerability was introduced in a UDT contract upgrade on August 2nd 2021 and discovered on October 14th around 1045AM ET. A patch was successfully deployed on [the same day at about 1PM ET](https://etherscan.io/tx/0x615f52d89673d41e7c5d3940beb50d586331f4664bae69556ef70b877175896c). The vulnerability was *not* exploited.

# The vulnerability

In a nutshell, the vulnerability *allowed anyone to burn tokens from any other address.* Even though this could not have resulted in funds being transferred, and we could have recovered any "burned" tokens through a contract upgrade, we believe it could have impacted the price and behavior of the protocol in ways that would have been hard to recover from.

The UDT contract did not originally included a `burn` function. However, in order to support [governance](https://unlock-protocol.com/blog/unlock-dao) functions, we had to perform an upgrade to our contract on August 2nd 2021. Even though we only used [OpenZeppelin](https://openzeppelin.com/contracts/)'s library for the UDT contract (and did not write any logic ourselves), the upgrade required some very specific work to support changes in the contract storage between the version we deployed in November 2020 and the ERC20 version used for governance. Specifically, we had to flatten the OpenZeppelin library in order to apply some patches to avoid storage slot conflicts.

While doing, so we overlooked that we had to remove the `burn` function from the flattened contract file.

# The patch

Fixing the vulnerability was trivial: we just rendered the `burn` function non operating by removing the internal call to `_burn`. In a subsequent deployment, we completely removed the `burn` function so that calling it will result in errors.

# Signatures

We identified the vulnerability as we were debugging some signature issues. We had previously found that a lot of the delegations performed using the `delegateBySig` function did not effectively perform delegation as we expected. We found that the contract was *recovering* a signer address that did not match the actual signer on the front-end. The team at OpenZeppelin kindly helped us identify the issue, where we realized that when we performed that August 2nd update, we failed to call some required initializers (namely, `EIP712_init`, `ERC20Permit_init` and `ERC20Votes_init`). Not calling these lead to the signatures being computed in an unexpected way.

Our patch was thoroughly tested, but it was never tested *as an upgrade*, but rather as a whole new implementation/deployment. This is the root cause of the issues we were seeing.

# Moving forward

Even though the vulnerability was **not** exploited, we have put ourselves and all of the people who are governing the protocol *at risk*. This is not something we take lightly and we will have to perform a few important changes.

- We will add a new testing framework to test our changes *as upgrades* (on top of unit tests). We already leverage hardhat's amazing "local fork" feature and we will increase our use of this. We will additionally perform these tests as part of our CI cycle.
- We will perform an audit for the UDT contract. We have always considered, and this is still the case, that the funds at risk on the Unlock and PublicLock contracts (the core protocol) were in fact smaller than the cost of auditing (especially as the protocol still evolves quickly). However, this is not the case for the UDT contract. We have contacted a few firms and we will share results once we have them.
- Even though no funds were stolen, the signature issue we identified means that a lot of people who have claimed tokens for the airdrop did not actually delegate their votes. We have identified the list of all accounts that have been affected. We are pondering a way to cover the gas cost of them issuing a 2nd delegation and we'll have something to offer soon.

In closing, I want to offer a very special thank you to Hadrien and Francisco at OpenZeppelin who have been extremely helpful along the way.