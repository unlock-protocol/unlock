---
title: Emergency Upgrade
subTitle: Version 1-3 is now available
authorName: Nick Mancuso
publishDate: January 17, 2020
description: Explaining what went wrong and why we released a new version so quickly after our last upgrade.
image: /images/blog/emergency-upgrade-1-3/code_vulnerability.jpg
---

We recently noticed a vulnerability which if abused could have had bad consequences – but we caught it early and fixed it promptly. This post aims to explain the errors we made with our [most recent smart-contract update](https://unlock-protocol.com/blog/version-1-2/).

There were problems with this release which if targeted by an attacker had the potential to do one of the following:
 - Steal money made from previous key sales.
 - Break every lock (and key) using the new version - blocking new sales, preventing key owners from being recognized and preventing the lock owner from accessing any funds previously made.

We fixed the second issue very quickly, so no worries there.  But funds are at risk if your lock is impacted.  For that we need the owners of these locks themselves to upgrade ASAP. (there are 14 locks which are affected)

This only impacts locks created between Jan 6th until Jan 17th (locks created between the block #9227829 and the block #9295958). If you recently created a lock, please go to the Unlock dashboard to check if you are impacted. If the dashboard does not show a warning like the one below, **your lock is safe**.

<p style="text-align:center">
	<img src="/images/blog/emergency-upgrade-1-3/dashboard_warning.png" width="750px" alt="Dashboard warning">
</p>

So what happened?  Let’s start with the issue we were able to fix right away and then we’ll get to the juicy stuff.

## Break every lock using the new version

> This issue is about our deployment process.  We simply needed to take action before an attacker.  We will avoid this race condition in the future.

We recently changed the locks deployed to use the minimal proxy standard, [EIP-1167](https://eips.ethereum.org/EIPS/eip-1167).  This significantly reduces the cost to create new locks and leads to less blockchain bloat.  When using proxies any data set in the constructor is lost so instead we call a single-use function called `initialize`.

During normal operation a user calls `createLock` on our main Unlock contract.  That function will deploy the lock and call `initialize` in the same transaction.  It’s responsible for recording data such as the lock owner and the key price.

Proxies work by reading the implementation logic from a template.  The template is nothing more than a contract containing the logic / source code for each individual lock to leverage.

Additionally we allow the lock owner to `selfdestruct` their lock after it's outlived its usefulness. This allows them to be good citizens by freeing up data that is no longer relevant - reducing blockchain bloat, preventing nodes from maintaining state that no one is interested in anymore.

We forgot to `initialize` the template!

If someone figured this out before we did they could have called `initialize` on the template to make themselves the owner and then make an owner-only call to `selfdestruct` the contract.  OpenZeppelin has a section in their docs talking [about this specific concern](https://docs.openzeppelin.com/upgrades/2.6/writing-upgradeable#potentially-unsafe-operations).

Once the template has been destroyed, all proxies attempting to read the implementation logic will fail. This means no new purchases, no reading who owns a key, and no way to withdraw any funds raised from previous key sales.

We initialized the template and renounced ownership so that no one can ever call `selfdestruct`. We are working on [adding this to our deployment script](https://github.com/unlock-protocol/unlock/tree/julien-unlockjs) so this step is not overlooked in the future.

## Steal money from key sales

> This issue is due to a bug in our code.  The bug has been fixed so that any new locks created going forward are fine.  But some locks were impacted and we need lock owners to do the upgrade.

As described above, we recently introduced `initialize` calls to the process for creating locks.  Additionally it’s relevant to note that there is a fair bit of code enabling lock features.  So to preserve developer sanity we use inheritance instead of jamming everything into a single file.  Each individual contract we inherit may have some state to initialize.

When you inherit multiple contracts that require initialization, the top-level contract implements `initialize` and then forwards relevant information to the others.

There are three ways this can be done safely:
 1) Ensure that only one `initialize` function is public or external.
 2) Add a modifier to each `initialize` function to ensure it cannot be called twice.
 3) Use the same function signature so that only one implementation is accessible, and ensure that function cannot be called twice.

(1) is not a complete solution for us since we depend on OpenZeppelin.  In order for them to support a variety of use cases every contract uses a public initialize function.  They use option (2) instead.  Option (3) is a little risky as we make changes and add more features.

There were 2 `initialize` calls for which we did not handle this correctly:

```
  function initialize(
    address _tokenAddress
  ) public
  {
    tokenAddress = _tokenAddress;
    require(
      _tokenAddress == address(0) || IERC20(_tokenAddress).totalSupply() > 0,
      'INVALID_TOKEN'
    );
  }
```

and

```
  function initialize() public
  {
    // default to 10%
    refundPenaltyBasisPoints = 1000;
  }
```

These two calls are public and have no modifier.  This means anyone can call them at any time on affected locks.

We have a number of other `initialize` functions but they were all safe using one of the three techniques explained above.

The impact of this is anyone can change the token a lock is priced in.  And anyone can reset the refund penalty back to the default value of 10%.

Doesn’t sound so bad at first.  But let’s consider how an attacker could use this to their benefit.  Here’s how you could leverage this bug to steal funds:
 - Find a test ERC-20 token. There are a few publicly available or you could create your own. We just need a way to mint a balance for free.
 - Mint test tokens for yourself.
 - Find a lock on the broken version with any money inside (from previous key sales).
 - Call `initialize(address _tokenAddress)` to change the lock to be priced in the test token you’re using.
 - Buy a key as normal -- but you are spending test tokens / fake money.
 - Call `initialize(address _tokenAddress)` to change the lock back to its original currency.
 - Call `cancelAndRefund()` to get a partial refund for your purchase.

You spend fake money and then are refunded with real money.  And if the lock owner tries to disable cancels by increasing the refund penalty, the attacker simply calls `initialize()` to reset it back to 10%.

We fixed this by making all our custom initialize functions `internal` and tested to confirm that the remaining publicly accessible calls cannot be called multiple times.

<p style="text-align:center">
	<img src="/images/blog/emergency-upgrade-1-3/code_vulnerability.jpg" width="400px" alt="Smart contracts">
</p>

So go to the dashboard to confirm your locks are not impacted.  There are very few at risk and nearly no funds for people to steal, but we need to ensure impacted locks are upgraded before you start to make sales.

How to upgrade:
 - Go to the Unlock dashboard
 - Create a new lock with the same settings as before
 - Update any integrations with the new lock address

If you had sold any keys on an impacted lock:
 - Call `withdraw` ASAP to secure your funds
 - Call `grantKeys` on the new lock to ensure your members did not lose anything in the process

Over the coming weeks we will be discussing what we can do to help ensure we don't make an error like this again in the future.

The issues have been fixed.  You should not feel hesitant to use the system because of what was discussed above.  In the end, no lock owner has lost funds and end-users (those purchasing keys) were never at risk at all.

Questions or concerns? Get in touch we’d be happy to explain further: hello@unlock-protocol.com
