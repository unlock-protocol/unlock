#! /bin/sh
SRC_DOCS_FOLDER="$(pwd)/docs"
DEST_DOCS_FOLDER="$(pwd)/docs-reorg"

# build docs
yarn hardhat dodoc

# delete existing folder
rm -rf $DEST_DOCS_FOLDER
mkdir -p $DEST_DOCS_FOLDER

# first archive all 
cp -R $SRC_DOCS_FOLDER $DEST_DOCS_FOLDER
mv $DEST_DOCS_FOLDER/docs $DEST_DOCS_FOLDER/archive
rm -rf $DEST_DOCS_FOLDER/archive/col

# docusaurus titles
echo '{
  "label": "Reference",
  "position": 3
}' > "$DEST_DOCS_FOLDER/_category_.json"
echo '{
  "label": "Past Versions"
}' > "$DEST_DOCS_FOLDER/archive/_category_.json"

# find latest versions
latest_template=$(ls $SRC_DOCS_FOLDER/PublicLock/IPublicLockV* | sed -e 's/[^0-9][^0-9]*\([0-9][0-9]*\).*/\1/g' | sort -nr | head -n1)
latest_unlock=$(ls $SRC_DOCS_FOLDER/Unlock/IUnlockV* | sed -e 's/[^0-9][^0-9]*\([0-9][0-9]*\).*/\1/g' | sort -nr | head -n1)

# get latest versions out of archive folder
mv "$DEST_DOCS_FOLDER/archive/PublicLock/IPublicLockV${latest_template}.md" "$DEST_DOCS_FOLDER/PublicLock.md"
mv "$DEST_DOCS_FOLDER/archive/Unlock/IUnlockV${latest_unlock}.md" "$DEST_DOCS_FOLDER/Unlock.md"

# change titles
sed -i -e "s/IPublicLockV${latest_template}/PublicLock (v${latest_template})/g" "$DEST_DOCS_FOLDER/PublicLock.md"
sed -i -e "s/IUnlockV${latest_unlock}/Unlock (v${latest_unlock})/g" "$DEST_DOCS_FOLDER/Unlock.md"

### add README
echo $'---
sidebar_position: 1
title: Unlock Smart Contract Interface Reference
pagination_next: core-protocol/unlock/README
description: >-
  Guide to Unlock Protocol smart contracts including where to find them and how
  they can be used.
---

# Interface References

This section of the docs is generated automatically from the smart contract 
interface references. 
<a href="https://github.com/unlock-protocol/unlock/tree/master/smart-contracts/contracts/interfaces">
    <button class="button button-primary">See them on GitHub</button>
</a>

## Using Smart Contract Interfaces
A Solidity contract interface is a list of function definitions without 
implementation. This allows for a seperation between the interface and the 
implementation much like Abstract Base Classes in Python or C++. 

You can use these interfaces in your own smart contracts to interact with
Unlock Protocol smart contracts, however they cannot be used to instaiate a
new class.

### npm module

We\'ve packaged the interfaces along with the contracts. 
<a href="https://www.npmjs.com/package/@unlock-protocol/contracts">
    <button class="button button-primary">See it on npm</button>
</a>

### Load it in your project
Add them to your project using yarn
```shell
yarn add @unlock-protocol/contracts
```
or npm
```shell
npm i @unlock-protocol/contracts
```

### Examples use cases

#### Creating Hooks
Let\'s say for instance you\'d like people to be able to sell their memberships,
however you don\'t want people to pass these around too often to limit turnover. 
So you want to let people transfer them but when they do you don\'t want to 
charge a fee but instead want to zero out the duration of time left. This might 
make sense if you have an exclusive membership, like country club with access to 
physical space, limited in the number of people. 

Interfaces can be used to inject custom logic into a lock by registering
an onTransferHook that calls the `expireAndRefundFor` function.

```solidity
pragma solidity 0.8.17;
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";

contract TransferHook {
    /** Constructor */
    constructor() {}

    /** Function called after a transfer has completed */

  function onKeyTransfer(
    address lockAddress,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint expirationTimestamp
  ) external{
    
    /** Expire the key but the refund amount is zero */
    IPublicLockV12(msg.sender).expireAndRefundFor(tokenId, 0)
  
  };
}

```
:::note
In order for the above hook to work you must ensure you set the contract
address as a LockManager using `addLockManager` since the `expireAndRefundFor` 
function call requires the LockManager role.
:::

You can find more examples of hooks like this in the 
[Smart Contracts/Hooks](/tutorials/smart-contracts/hooks/)
section of the tutorials.

#### Using them inside other smart contracts

If you want to add subscription service functionality you can use them inside of
other smart contracts to check for key ownership to the subscription Lock you\'ve
created. You can see an example of how that can be done to add paid functions
to your dApps using Unlock in our [Smart Contracts/Unlocking Smart Contracts](/tutorials/smart-contracts/using-unlock-in-other-contracts) 
section of the tutorials.
' > "$DEST_DOCS_FOLDER/README.md"

# docusaurus titles
echo '{
  "label": "Reference",
  "position": 3
}' > "$DEST_DOCS_FOLDER/_category_.json"
echo '{
  "label": "Past Versions"
}' > "$DEST_DOCS_FOLDER/archive/_category_.json"

# replace docs
rm -rf $SRC_DOCS_FOLDER
mv $DEST_DOCS_FOLDER $SRC_DOCS_FOLDER

