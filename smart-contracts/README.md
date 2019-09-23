# Smart Contracts

This is the code for Unlock protocol's smart contracts.
There are 2 "main" smart contracts:

- Unlock
- Lock

## High-Level overview of contracts & Interfaces

## Lock

The lock contract is a smart contract “class”, deployed on an Ethereum Blockchain and written in Solidity. Each instance is owned by a creator and represents access to a given resource (or set of resources). The Lock keeps track of its keys, which are non fungible tokens. We do not expect any deployed lock to be upgraded, however we will likely introduce more complex versions of the Lock with more features or characteristics.

One of its characteristics is that instances of it are deployed **from the Unlock Protocol smart contract**. The goal of this is to guarantee that the Unlock Protocol smart contract can keep track of revenue it generates as well as decides of discounts when users purchase them. As such the “address” of the Unlock Smart Contract is kept in each Lock contract and can only be changed by the Unlock Smart Contract itself.

The Lock Smart Contract should implement [ERC721](https://github.com/ethereum/eips/issues/721) . We should also make sure the token can be used with existing ecosystem elements such as protocols (0x) and existing applications (Metamask, Toshi, Rarebits…) which would ease user adoption.

One of the design decisions shaping the lock contract was to make it customizable so it can adapt to the very large set of capabilities which locks can cover.

It is worth considering whether we have a single "Lock" smart contract, or multiple different Lock smart contracts inheriting from the "base" Lock smart contract. The latter may actually a lot more cost efficient.

The Lock Smart Contract has multiple capabilities:

- _Administrative_: these are the functions which change ownership of the lock or change the address of the Unlock Protocol smart contract, as well as the maximum number of keys, their release mechanism (public, pre-validated, private) or their expiration (period, date or interval) and of course their price (including the mechanism used to set the price: fixed or variable). Finally, there is a method to withdraw funds from the lock contract itself.
- _Transfering key ownership_: keys can be purchased from the lock smart contract itself or from another user who purchased one previously. Another element is that keys can be purchased on behalf of somebody else (this is important because this lets somebody pay gas fees on behalf of somebody else)
- _Changing key attributes_: the keys have an expiration date which can be changed (for an earlier date by the lock owner) as well as data attributes which can be changed to something else.

#### Structs

##### Key

The key is a struct which encapsulate data relative to an individual key.
It has the following fields:

- _Expiration date_ (date): the timestamp at which the key is not considered valid anymore. The lock owner only can change this value, effectively expiring individual keys.
- _Data field (string)_: this can be changed only by the key owner who may use this to mark the key. The size of this field is unbounded and should be used as a pointer to the actual data. It can also be used to store encrypted data to identify the key owner.

#### Data

1. Unlock Protocol address (UPC): This is the address of the Unlock Protocol Contract. It is set upon creation of the Lock and will be used to invoke the Lock when recording key purchases and more.

2. Owner address: Address of the owner of the Lock smart contract. This address is able to withdraw funds from the contract as well as grant keys, authorize individual purchases (if applicable)… etc.

3. Keys: This is a mapping of addresses to keys which represents the list of keys. In our approach each address can own at most one key per lock. We anticipate that smart contracts can themselves be key owners, allowing for shared ownership of a given key.

4. Owners: This is an array of all the owners of keys. It can be used to iterate over the keys.

5. Expiration Duration: This is the number of seconds during which each created key for this lock is valid by default when purchased. Lock owners can change individual key duration at their own discretion but the “default” is fixed.

6. Price: This is the price, expressed in Ether, of each individual key, set by the owner. This price can/should (TODO) be changed by the owner to reflect conversion rates if they want to provide a stable fiat currency price.

7. Max number of keys: The beneficiary can decide of a maximum number of keys to be sold publicly. If none is set (TODO), the contract can sell an unlimited number of keys.

8. List of approved transfers. This is applicable to both the lock owner approving new key purchasers or key owners approving another user to take over their key.

#### Methods

##### Administrative

These are the function which change some parameters for the Lock or check its status

- setKeyPrice (TODO) : updates the price of new keys
- totalSupply : get the number of outstanding keys
- numberOfOwners : get the total number of unique owners (both expired and valid).  This may be larger than totalSupply.
- balanceOf (ERC721) : get the number of keys for a given owner (0 or 1)
- ownerOf (ERC721) : get the owner of a key (if applicable)
- keyDataFor : get the value of the data field for a key
- keyExpirationTimestampFor : get the expiration date for a key
- getApproved (ERC721) : get the address of the approved recipient for a key ()
- withdraw : lets the owner of the lock withdraw the funds on the lock

#### Transfering key owner:

Keys can be purchased from the lock smart contract itself or from another user. Another important element is that keys can be purchased on behalf of somebody else (this is important because this lets somebody pay Eth fees on behalf on somebody else)

- purchaseFor : purchases a key for a given address and sets its data field
- purchaseForFrom : purchases a key for a given address after a referral and sets its data field.
- transferFrom (ERC721) : transfers ownership of a key
- approve (ERC721) : approve transfer of a key

#### Changing key attributes:

The keys have an expiration date which can be changed (for an earlier date by the lock owner), or data attributes which can be changed to something else, by their owner only.

- expireKeyFor : Expires an existing
- changeKeyData (TODO) : change the data field for a given key

#### Modifiers

We use modifiers to restrict calls to certain functions.

- onlyPublic : can only be called on public locks
- onlyLockOwnerOnRestrictedOrKeyOwnerInPublic : can only be called by the lock owner on a restricted or public lock or by the key owner on a public lock.
- hasKey : can only be called for existing key
- hasValidKey : can only be called for existing and valid key
- onlyKeyOwner : can only be called by the owner of the key
- onlyPublicOrApproved : Ensures that the lock is public or that the sender has been approved on restricted locks
- onlyKeyOwnerOrApproved : Ensures that the caller has a key or that the caller has been approved for ownership of that key
- notSoldOut : Ensures that not all keys have been sold.

#### Events

TK

## Unlock

The Unlock Smart contract is only deployed once. It has several roles:

- Deploying Locks: locks are deployed through the Unlock smart contract. This is important because the Locks will actually invoke the Unlock smart contract when keys are sold and the Unlock smart contract will check that the invoking lock has been deployed through it.
- Keeping Track of the Unlock Discount Tokens. Unlock Discount Tokens are ERC20 tokens (TODO) which implement the Unlock network loyalty program. The Discount Tokens are granted when keys are purchased, either thru referrals or when a creator grants a discount.
- Granting Discount. The Unlock smart contract will compute the available discount for each key purchase based on the amount of discount tokens owned by the key buyer.

This smart contract needs to be "upgradable" to deploy changes. It is critical that its address does not change however so that all the Locks deployed by it can still access it.
We are using zeppelinOS (zOS) to enable upgradeability. This requires us to use openzeppelin-eth (instead of openzeppelin-solidity), as its contracts have been modified to use init functions instead of constructors. Openzeppelin-solidity does not work correctly!

#### Structs

##### LockBalances

The LockBalances is a struct which encapsulate data relative to an individual lock deployed through the smart contract. Keeping these balances will help us assess how many discount tokens a given lock can yield optimaly.

It has the following fields:

- _deployed_ (boolean) : A boolean to indicate that a lock has been deployed (this is required because both default values for `tokenSales` and `yieldedDiscountTokens` are 0 which is the same for non deployed locks).
- _totalSales_ (unsigned integer) : An unsigned integer to keep track of the total sales for this lock.
- _yieldedDiscountTokens_ (unsigned integer): An unsigned integer to keep track of the total number of discount tokens yielded through that lock.

#### Data

1. Owner of the Unlock Discount Token smart contract. This is by default the deployer of the Unlock smart contract but all discount token holders can eventually vote to replace that owner.

2. Max available discount share (TODO): this is the first golden rule of the protocol, fixed at 20% for now. The owner only can adjust that value.

3. Max growth rate for the token supply (TODO): this is the 2nd golden rule of the protocol, fixed at 50% of the network growth for now. The owner only can adjust that value.

4. The total network's gross product (TODO): this is the total sales generated on the network for all keys sold from all locks. We should also "snapshot" that value at intervals to keep track of the network's growth rate.

5. This is the total amount of discounts granted (TODO). This is akin to the total network's gross product and used to compute the total available discount at any point in time.

6. A mapping of lock addresses into LockBalances which is used to ensure that only deployed locks are invoking certain methods. The data is also used to make sure each Lock only distributes an "appropriate" number of discount tokens.

7. Token name (ERC20 TODO)

8. Symbol (ERC20 TODO)

9. Decimals (ERC20 TODO)

10. Total supply of discount tokens (ERC20 TODO)

11. Balances of Discount Tokens balances (ERC20 TODO)

12. Allowed transfers of Discount Tokens (ERC20 TODO)

#### Methods

##### ERC20

See https://theethereum.wiki/w/index.php/ERC20_Token_Standard

##### Locks

The Unlock smart contract provides several functions to handle locks. One of them is to deploy them and previously deployed locks (and only them) can invoke a set of functions on the Unlock Smart Contract.

- createLock: This function can be invoked by anyone and will deploy a lock which belongs to them. The Lock can be deployed with its key release mechanism (public, restricted, private), the duration for each key, the price for each key and the maximum number of keys per lock.

- computeAvailableDiscountFor: This function does not change the state. When provided a user's address, and the price of a key, it will return a pair which corresponds to the maximum discount available to a user. That pair includes both the amount of discount (in Eth) and the balance of the user's discount tokens used to provide that discount.

- recordKeyPurchase: This function can only be invoked by previously deployed locks. This function keeps track of the added GDP, as well as grants of discount tokens to the referrer, if applicable. The number of discount tokens granted is based on the value of the referal, the current growth rate and the lock's discount token distribution rate.

- recordConsumedDiscount: This function can only be invoked by previously deployed locks and keeps track of consumed discounts by a given user. It also grants discount tokens to the creator who is granting the discount based on the amount of discount and compensation rate.

#### Modifiers

We use modifiers to restrict calls to certain functions.

- onlyFromDeployedLock: this method can only be invoked by a previously deployed lock.

#### Events

TODO

## Usage

The smart contracts are written in solidity using the [truffle framework](http://truffleframework.com/).
The can be compiled using `truffle compile` and tested using `truffle test`. Make sure dependencies are installed before running commands: `npm install`.

Later this will also be used to deploy to the test and main chains.
