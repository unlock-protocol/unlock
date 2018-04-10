# Smart Contracts

This is the code for Unlock protocol's smart contracts.
There are 2 smart contracts:
* Unlock
* Lock

## Lock

The lock contract is a smart contract “class”, deployed, for now at least, on the Ethereum Blockchain and written in Solidity. Each instance is owned by a creator and represents access to a given resource (or set of resources). The Lock keeps track of its keys, which are non fungible tokens.

 One of its characteristics is that instances of it are deployed __from the Unlock Protocol smart contract__. The goal of this is to guarantee that the Unlock Protocol Smart Contract can keep track of revenue it generates as well as decides of discount when users purchase them. As such the “address” of the Unlock Smart Contract is kept and can only be changed by the Unlock Smart Contract itself (in case of a migration for example).

The Lock Smart Contract should eventually implement [ERC721](https://github.com/ethereum/eips/issues/721) (or similar). We should also make sure the token can be used with existing ecosystem elements such as protocols (0x) and existing applications (Metamask, Toshi, Rarebits…) which would ease user adoption.

One of the design decisions between the lock contract is to make it as customizable as possible to cover the very large set of capabilities which locks can cover.

The Lock Smart Contract has multiple capabilities:

* _Administrative_: these are the function which change ownership of the lock or change the address of the Unlock Protocol smart contract, as well as the maximum number of keys, their release mechanism (public, pre-validated, private) or their expiration (period, date or interval) and of course their price (including, even the mechanism used to set the price: fixed or variable). Finally, there is a method to withdraw funds from the lock contract itself. We also include methods to "reclaim" space taken by expired keys.
* _Transfering key ownership_: keys can be purchased from the lock smart contract itself or from another user. Another element is that keys can be purchased on behalf of somebody else (this is important because this lets somebody pay Eth fees on behalf on somebody else)
* _Changing key attributes_: the keys have an expiration date which can be changed (for an earlier date by the lock owner), or data attributes which can be changed to something else.
* _Assessing ownership_: the smart contract provides a mechanism for the owner to sign her token. Other actors can then verify the signature validity using the smart contract.


### Tech spec

#### Structs

##### Key

The key is a struct which encapsulate data relative to an individual key.
It has the following fields:
* _Expiration date_ (date): the timestamp at which the key is not considered valid anymore. The lock owner only can change this value, effectively expiring individual keys.
* _Data field (string)_: this can be changed only by the key owner who may use this to mark the key. The size of this field is unbounded and should be used as a pointer to the actual data.

#### Data

1. Unlock Protocol address (UPC): This is the address of the Unlock Protocol Contract address. It can only be changed from the UPC address itself. It is being used to both record transactions and compute the discount amount.

2. Beneficiary address: Address of the owner of the Lock smart contract. This address is able to withdraw funds from the contract as well as grant keys, authorize individual purchases (if applicable)… etc.

3. Key Owners: This is a mapping of addresses to keys which represents the list of key owners. In our approach each address can own at most one key per lock. We anticipate that smart contracts can themselves be key owners, allowing for shared ownership of a given key.

4. Expiration Duration: This is the number of seconds during which each created key for this lock is valid by default when purchased. Lock owners can change individual key duration at their own discretion but the “default” is fixed.

5. Expiration Date: Alternatively, some tokens may have a fixed expiration date, no matter when they have been purchased. They may be “event” tokens. This field would be set and if it is set, it overrides the expiration duration.

6. Price Calculator address: The price of each key can be fixed or computed according to some external data performed by a 3rd party contract. This will be useful to use data from stable coins in order to guarantee a fairly consistent price in $. It can also be used to compute a price in the context of token currated registries.

7. Price: This is the price, expressed in Eth, of each individual key, set by the owner. This price can/should be changed by the owner to reflect conversion rates if they want to provide a stable fiat currency price.

8. Max number of keys: The beneficiary can decide of a maximum number of keys to be sold publicly. If none is set, the contract can sell an unlimited number of keys.

#### Methods

##### Administrative

These are the function which change ownership of the lock or change the address of the Unlock Protocol smart contract, as well as the maximum number of keys, their release mechanism (public, pre-validated, private) or their expiration (period or date) and of course their price.
* setMaxNumberOfKeys
* setKeysReleaseMechanism (private, pre-approved, public)
* setKeysExpirationDate
* setKeysExpirationDuration
* setEthPriceFunction
* setEthPrice
* setBeneficiaryAddress
* setUnlockProtocolAddress

#### Transfering key owner:

Keys can be purchased from the lock smart contract itself or from another user. Another important element is that keys can be purchased on behalf of somebody else (this is important because this lets somebody pay Eth fees on behalf on somebody else)
* assignKey
* purchaseKey
* purchaseKeyOnBehalfOf
* transferKeyTo

#### Changing key attributes:

The keys have an expiration date which can be changed (for an earlier date by the lock owner), or data attributes which can be changed to something else, by their owner only.

* setKeyExpirationDate
* setKeyData

#### Modifiers

TODO

## Unlock

TODO

## Usage

The smart contracts are written in solidity using the [truffle framework](http://truffleframework.com/).
The can be compiled using `truffle compile` and tested using `truffle test`. Make sure dependencies are installed before running commands: `npm install`.

Later this will also be used to deploy to the test and main chains.