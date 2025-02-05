# Solidity API

## IPublicLockV10

### initialize

```solidity
function initialize(address _lockCreator, uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName) external
```

Functions

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external pure returns (bytes32 role)
```

### KEY_GRANTER_ROLE

```solidity
function KEY_GRANTER_ROLE() external pure returns (bytes32 role)
```

### LOCK_MANAGER_ROLE

```solidity
function LOCK_MANAGER_ROLE() external pure returns (bytes32 role)
```

### publicLockVersion

```solidity
function publicLockVersion() external pure returns (uint16)
```

The version number of the current implementation on this network.

#### Return Values

| Name | Type   | Description                 |
| ---- | ------ | --------------------------- |
| [0]  | uint16 | The current version number. |

### withdraw

```solidity
function withdraw(address _tokenAddress, uint256 _amount) external
```

_Called by a lock manager or beneficiary to withdraw all funds from the lock and send them to the `beneficiary`.
Throws if called by other than a lock manager or beneficiary_

#### Parameters

| Name           | Type    | Description                                                                                                                                                                                                                                                 |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_tokenAddress | address | specifies the token address to withdraw or 0 for ETH. This is usually the same as `tokenAddress` in MixinFunds.                                                                                                                                             |
| \_amount       | uint256 | specifies the max amount to withdraw, which may be reduced when considering the available balance. Set to 0 or MAX_UINT to withdraw everything. -- however be wary of draining funds as it breaks the `cancelAndRefund` and `expireAndRefundFor` use cases. |

### approveBeneficiary

```solidity
function approveBeneficiary(address _spender, uint256 _amount) external returns (bool)
```

An ERC-20 style approval, allowing the spender to transfer funds directly from this lock.

#### Parameters

| Name      | Type    | Description                                         |
| --------- | ------- | --------------------------------------------------- |
| \_spender | address | address that can spend tokens belonging to the lock |
| \_amount  | uint256 | amount of tokens that can be spent by the spender   |

### updateKeyPricing

```solidity
function updateKeyPricing(uint256 _keyPrice, address _tokenAddress) external
```

A function which lets a Lock manager of the lock to change the price for future purchases.

_Throws if called by other than a Lock manager
Throws if lock has been disabled
Throws if \_tokenAddress is not a valid token_

#### Parameters

| Name           | Type    | Description                                                                 |
| -------------- | ------- | --------------------------------------------------------------------------- |
| \_keyPrice     | uint256 | The new price to set for keys                                               |
| \_tokenAddress | address | The address of the erc20 token to use for pricing the keys, or 0 to use ETH |

### setExpirationDuration

```solidity
function setExpirationDuration(uint256 _newExpirationDuration) external
```

A function to change the default duration of each key in the lock
keys previously bought are unaffected by this change (i.e.
existing keys timestamps are not recalculated/updated)

#### Parameters

| Name                    | Type    | Description                                                                            |
| ----------------------- | ------- | -------------------------------------------------------------------------------------- |
| \_newExpirationDuration | uint256 | the new amount of time for each key purchased or type(uint).max for a non-expiring key |

### updateBeneficiary

```solidity
function updateBeneficiary(address _beneficiary) external
```

A function which lets a Lock manager update the beneficiary account,
which receives funds on withdrawal.

_Throws if called by other than a Lock manager or beneficiary
Throws if \_beneficiary is address(0)_

#### Parameters

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| \_beneficiary | address | The new address to set as the beneficiary |

### getHasValidKey

```solidity
function getHasValidKey(address _user) external view returns (bool)
```

Checks if the user has a non-expired key.

#### Parameters

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| \_user | address | The address of the key owner |

### keyExpirationTimestampFor

```solidity
function keyExpirationTimestampFor(uint256 _tokenId) external view returns (uint256 timestamp)
```

_Returns the key's ExpirationTimestamp field for a given owner.
Returns 0 if the owner has never owned a key for this lock_

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_tokenId | uint256 | the id of the key |

### numberOfOwners

```solidity
function numberOfOwners() external view returns (uint256)
```

Public function which returns the total number of unique owners (both expired
and valid). This may be larger than totalSupply.

### updateLockName

```solidity
function updateLockName(string _lockName) external
```

Allows a Lock manager to assign a descriptive name for this Lock.

_Throws if called by other than a Lock manager_

#### Parameters

| Name       | Type   | Description               |
| ---------- | ------ | ------------------------- |
| \_lockName | string | The new name for the lock |

### updateLockSymbol

```solidity
function updateLockSymbol(string _lockSymbol) external
```

Allows a Lock manager to assign a Symbol for this Lock.

_Throws if called by other than a Lock manager_

#### Parameters

| Name         | Type   | Description                 |
| ------------ | ------ | --------------------------- |
| \_lockSymbol | string | The new Symbol for the lock |

### symbol

```solidity
function symbol() external view returns (string)
```

_Gets the token symbol_

#### Return Values

| Name | Type   | Description                          |
| ---- | ------ | ------------------------------------ |
| [0]  | string | string representing the token symbol |

### setBaseTokenURI

```solidity
function setBaseTokenURI(string _baseTokenURI) external
```

Allows a Lock manager to update the baseTokenURI for this Lock.

_Throws if called by other than a Lock manager_

#### Parameters

| Name           | Type   | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| \_baseTokenURI | string | String representing the base of the URI for this lock. |

### tokenURI

```solidity
function tokenURI(uint256 _tokenId) external view returns (string)
```

A distinct Uniform Resource Identifier (URI) for a given asset.

_Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC 3986. The URI may point to a JSON file that conforms to the "ERC721
Metadata JSON Schema".
https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md_

#### Parameters

| Name      | Type    | Description                       |
| --------- | ------- | --------------------------------- |
| \_tokenId | uint256 | The tokenID we're inquiring about |

#### Return Values

| Name | Type   | Description                                         |
| ---- | ------ | --------------------------------------------------- |
| [0]  | string | String representing the URI for the requested token |

### setEventHooks

```solidity
function setEventHooks(address _onKeyPurchaseHook, address _onKeyCancelHook, address _onValidKeyHook, address _onTokenURIHook) external
```

Allows a Lock manager to add or remove an event hook

#### Parameters

| Name                | Type    | Description                                                         |
| ------------------- | ------- | ------------------------------------------------------------------- |
| \_onKeyPurchaseHook | address | Hook called when the `purchase` function is called                  |
| \_onKeyCancelHook   | address | Hook called when the internal `_cancelAndRefund` function is called |
| \_onValidKeyHook    | address |                                                                     |
| \_onTokenURIHook    | address |                                                                     |

### grantKeys

```solidity
function grantKeys(address[] _recipients, uint256[] _expirationTimestamps, address[] _keyManagers) external
```

Allows a Lock manager to give a collection of users a key with no charge.
Each key may be assigned a different expiration date.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                   | Type      | Description                                                  |
| ---------------------- | --------- | ------------------------------------------------------------ |
| \_recipients           | address[] | An array of receiving addresses                              |
| \_expirationTimestamps | uint256[] | An array of expiration Timestamps for the keys being granted |
| \_keyManagers          | address[] |                                                              |

### purchase

```solidity
function purchase(uint256[] _values, address[] _recipients, address[] _referrers, address[] _keyManagers, bytes[] _data) external payable
```

when called for an existing and non-expired key, the `_keyManager` param will be ignored

_Purchase function
Setting \_value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the
price while my transaction is pending I can't be charged more than I expected (only applicable to ERC-20 when more
than keyPrice is approved for spending)._

#### Parameters

| Name          | Type      | Description                                                                                                                            |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| \_values      | uint256[] | array of tokens amount to pay for this purchase >= the current keyPrice - any applicable discount (\_values is ignored when using ETH) |
| \_recipients  | address[] | array of addresses of the recipients of the purchased key                                                                              |
| \_referrers   | address[] | array of addresses of the users making the referral                                                                                    |
| \_keyManagers | address[] | optional array of addresses to grant managing rights to a specific address on creation                                                 |
| \_data        | bytes[]   | array of arbitrary data populated by the front-end which initiated the sale                                                            |

### extend

```solidity
function extend(uint256 _value, uint256 _tokenId, address _referrer, bytes _data) external payable
```

_Extend function
Throws if lock is disabled or key does not exist for \_recipient. Throws if \_recipient == address(0)._

#### Parameters

| Name       | Type    | Description                                                                                                                         |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| \_value    | uint256 | the number of tokens to pay for this purchase >= the current keyPrice - any applicable discount (\_value is ignored when using ETH) |
| \_tokenId  | uint256 | the id of the key to extend                                                                                                         |
| \_referrer | address | address of the user making the referral                                                                                             |
| \_data     | bytes   | arbitrary data populated by the front-end which initiated the sale                                                                  |

### mergeKeys

```solidity
function mergeKeys(uint256 _tokenIdFrom, uint256 _tokenIdTo, uint256 _amount) external
```

Merge existing keys

#### Parameters

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| \_tokenIdFrom | uint256 | the id of the token to substract time from  |
| \_tokenIdTo   | uint256 | the id of the destination token to add time |
| \_amount      | uint256 | the amount of time to transfer (in seconds) |

### burn

```solidity
function burn(uint256 _tokenId) external
```

Deactivate an existing key
the key will be expired and ownership records will be destroyed

#### Parameters

| Name      | Type    | Description             |
| --------- | ------- | ----------------------- |
| \_tokenId | uint256 | the id of token to burn |

### setGasRefundValue

```solidity
function setGasRefundValue(uint256 _gasRefundValue) external
```

_Set the value to be refunded to the sender on purchase_

#### Parameters

| Name             | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| \_gasRefundValue | uint256 | price in wei or token in smallest price unit |

### gasRefundValue

```solidity
function gasRefundValue() external view returns (uint256 _gasRefundValue)
```

\_gasRefundValue price in wei or token in smallest price unit

_Returns the value/rpice to be refunded to the sender on purchase_

### purchasePriceFor

```solidity
function purchasePriceFor(address _recipient, address _referrer, bytes _data) external view returns (uint256)
```

returns the minimum price paid for a purchase with these params.

_this considers any discount from Unlock or the OnKeyPurchase hook._

### updateTransferFee

```solidity
function updateTransferFee(uint256 _transferFeeBasisPoints) external
```

Allow a Lock manager to change the transfer fee.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                     | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| \_transferFeeBasisPoints | uint256 | The new transfer fee in basis-points(bps). Ex: 200 bps = 2% |

### getTransferFee

```solidity
function getTransferFee(uint256 _tokenId, uint256 _time) external view returns (uint256)
```

Determines how much of a fee would need to be paid in order to
transfer to another account. This is pro-rated so the fee goes
down overtime.

_Throws if \_tokenId does not have a valid key_

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| \_tokenId | uint256 | The id of the key check the transfer fee for. |
| \_time    | uint256 | The amount of time to calculate the fee for.  |

#### Return Values

| Name | Type    | Description                  |
| ---- | ------- | ---------------------------- |
| [0]  | uint256 | The transfer fee in seconds. |

### expireAndRefundFor

```solidity
function expireAndRefundFor(uint256 _tokenId, uint256 _amount) external
```

_Invoked by a Lock manager to expire the user's key
and perform a refund and cancellation of the key
Throws if called by other than a Lock manager
Throws if \_keyOwner does not have a valid key_

#### Parameters

| Name      | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| \_tokenId | uint256 | The key id we wish to refund to       |
| \_amount  | uint256 | The amount to refund to the key-owner |

### cancelAndRefund

```solidity
function cancelAndRefund(uint256 _tokenId) external
```

_allows the key manager to expire a given tokenId
and send a refund to the keyOwner based on the amount of time remaining._

#### Parameters

| Name      | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| \_tokenId | uint256 | The id of the key to cancel. |

### updateRefundPenalty

```solidity
function updateRefundPenalty(uint256 _freeTrialLength, uint256 _refundPenaltyBasisPoints) external
```

Allow a Lock manager to change the refund penalty.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| \_freeTrialLength          | uint256 | The new duration of free trials for this lock |
| \_refundPenaltyBasisPoints | uint256 | The new refund penaly in basis-points(bps)    |

### getCancelAndRefundValue

```solidity
function getCancelAndRefundValue(address _keyOwner) external view returns (uint256 refund)
```

_Determines how much of a refund a key owner would receive if they issued_

#### Parameters

| Name       | Type    | Description                                                                                                                                                                                                    |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_keyOwner | address | The key owner to get the refund value for. a cancelAndRefund block.timestamp. Note that due to the time required to mine a tx, the actual refund amount will be lower than what the user reads from this call. |

### addKeyGranter

```solidity
function addKeyGranter(address account) external
```

### addLockManager

```solidity
function addLockManager(address account) external
```

### isKeyGranter

```solidity
function isKeyGranter(address account) external view returns (bool)
```

### isLockManager

```solidity
function isLockManager(address account) external view returns (bool)
```

### onKeyPurchaseHook

```solidity
function onKeyPurchaseHook() external view returns (address)
```

### onKeyCancelHook

```solidity
function onKeyCancelHook() external view returns (address)
```

### onValidKeyHook

```solidity
function onValidKeyHook() external view returns (bool)
```

### onTokenURIHook

```solidity
function onTokenURIHook() external view returns (string)
```

### revokeKeyGranter

```solidity
function revokeKeyGranter(address _granter) external
```

### renounceLockManager

```solidity
function renounceLockManager() external
```

### setMaxNumberOfKeys

```solidity
function setMaxNumberOfKeys(uint256 _maxNumberOfKeys) external
```

_Change the maximum number of keys the lock can edit_

#### Parameters

| Name              | Type    | Description                     |
| ----------------- | ------- | ------------------------------- |
| \_maxNumberOfKeys | uint256 | uint the maximum number of keys |

### setMaxKeysPerAddress

```solidity
function setMaxKeysPerAddress(uint256 _maxKeysPerAddress) external
```

Set the maximum number of keys a specific address can use

#### Parameters

| Name                | Type    | Description                              |
| ------------------- | ------- | ---------------------------------------- |
| \_maxKeysPerAddress | uint256 | the maximum amount of key a user can own |

### maxKeysPerAddress

```solidity
function maxKeysPerAddress() external view returns (uint256)
```

#### Return Values

| Name | Type    | Description                                            |
| ---- | ------- | ------------------------------------------------------ |
| [0]  | uint256 | the maximum number of key allowed for a single address |

### beneficiary

```solidity
function beneficiary() external view returns (address)
```

===================================================================
Auto-generated getter functions from public state variables

### expirationDuration

```solidity
function expirationDuration() external view returns (uint256)
```

### freeTrialLength

```solidity
function freeTrialLength() external view returns (uint256)
```

### keyPrice

```solidity
function keyPrice() external view returns (uint256)
```

### maxNumberOfKeys

```solidity
function maxNumberOfKeys() external view returns (uint256)
```

### refundPenaltyBasisPoints

```solidity
function refundPenaltyBasisPoints() external view returns (uint256)
```

### tokenAddress

```solidity
function tokenAddress() external view returns (address)
```

### transferFeeBasisPoints

```solidity
function transferFeeBasisPoints() external view returns (uint256)
```

### unlockProtocol

```solidity
function unlockProtocol() external view returns (address)
```

### keyManagerOf

```solidity
function keyManagerOf(uint256) external view returns (address)
```

### shareKey

```solidity
function shareKey(address _to, uint256 _tokenId, uint256 _timeShared) external
```

Allows the key owner to safely share their key (parent key) by
transferring a portion of the remaining time to a new key (child key).

_Throws if key is not valid.
Throws if `_to` is the zero address
Emit Transfer event_

#### Parameters

| Name         | Type    | Description                                                                                                                                                                                                                           |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_to         | address | The recipient of the shared key                                                                                                                                                                                                       |
| \_tokenId    | uint256 | the key to share                                                                                                                                                                                                                      |
| \_timeShared | uint256 | The amount of time shared checks if `_to` is a smart contract (code size > 0). If so, it calls `onERC721Received` on `_to` and throws if the return value is not `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`. |

### setKeyManagerOf

```solidity
function setKeyManagerOf(uint256 _tokenId, address _keyManager) external
```

Update transfer and cancel rights for a given key

#### Parameters

| Name         | Type    | Description                                           |
| ------------ | ------- | ----------------------------------------------------- |
| \_tokenId    | uint256 | The id of the key to assign rights for                |
| \_keyManager | address | The address to assign the rights to for the given key |

### isValidKey

```solidity
function isValidKey(uint256 _tokenId) external view returns (bool)
```

Check if a certain key is valid
this makes use of the onValidKeyHook if it is set

#### Parameters

| Name      | Type    | Description                         |
| --------- | ------- | ----------------------------------- |
| \_tokenId | uint256 | the id of the key to check validity |

### name

```solidity
function name() external view returns (string _name)
```

A descriptive name for a collection of NFTs in this contract

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

From ERC165.sol

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256 balance)
```

_Returns the number of NFTs in `owner`'s account._

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address _owner)
```

_Returns the owner of the NFT specified by `tokenId`._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external
```

\_Transfers a specific NFT (`tokenId`) from one account (`from`) to
another (`to`).

Requirements:

- `from`, `to` cannot be zero.
- `tokenId` must be owned by `from`.
- If the caller is not `from`, it must be have been allowed to move this
  NFT by either `approve` or `setApprovalForAll`.\_

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external
```

\_Transfers a specific NFT (`tokenId`) from one account (`from`) to
another (`to`).

Requirements:

- If the caller is not `from`, it must be approved to move this NFT by
  either `approve` or `setApprovalForAll`.\_

### approve

```solidity
function approve(address to, uint256 tokenId) external
```

### getApproved

```solidity
function getApproved(uint256 _tokenId) external view returns (address operator)
```

Get the approved address for a single NFT

_Throws if `_tokenId` is not a valid NFT._

#### Parameters

| Name      | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| \_tokenId | uint256 | The NFT to find the approved address for |

#### Return Values

| Name     | Type    | Description                                                             |
| -------- | ------- | ----------------------------------------------------------------------- |
| operator | address | The approved address for this NFT, or the zero address if there is none |

### setApprovalForAll

```solidity
function setApprovalForAll(address _operator, bool _approved) external
```

disabled when transfers are disabled

_Sets or unsets the approval of a given operator
An operator is allowed to transfer all tokens of the sender on their behalf_

#### Parameters

| Name       | Type    | Description                                       |
| ---------- | ------- | ------------------------------------------------- |
| \_operator | address | operator address to set the approval              |
| \_approved | bool    | representing the status of the approval to be set |

### isApprovedForAll

```solidity
function isApprovedForAll(address _owner, address _operator) external view returns (bool)
```

_Tells whether an operator is approved by a given keyManager_

#### Parameters

| Name       | Type    | Description                                              |
| ---------- | ------- | -------------------------------------------------------- |
| \_owner    | address | owner address which you want to query the approval of    |
| \_operator | address | operator address which you want to query the approval of |

#### Return Values

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| [0]  | bool | bool whether the given operator is approved by the given owner |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external
```

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

### tokenOfOwnerByIndex

```solidity
function tokenOfOwnerByIndex(address _owner, uint256 index) external view returns (uint256 tokenId)
```

### tokenByIndex

```solidity
function tokenByIndex(uint256 index) external view returns (uint256)
```

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

Innherited from Open Zeppelin AccessControl.sol

### grantRole

```solidity
function grantRole(bytes32 role, address account) external
```

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external
```

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external
```

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

### transfer

```solidity
function transfer(address _to, uint256 _value) external returns (bool success)
```

An ERC-20 style transfer.

_The typical use case would be to call this with \_value 1, which is on par with calling `transferFrom`. If the user
has more than `expirationDuration` time remaining this may use the `shareKey` function to send some but not all of the token._

#### Parameters

| Name    | Type    | Description                                                                                             |
| ------- | ------- | ------------------------------------------------------------------------------------------------------- |
| \_to    | address |                                                                                                         |
| \_value | uint256 | sends a token with \_value \* expirationDuration (the amount of time remaining on a standard purchase). |

### owner

```solidity
function owner() external view returns (address)
```

`owner()` is provided as an helper to mimick the `Ownable` contract ABI.
The `Ownable` logic is used by many 3rd party services to determine
contract ownership - e.g. who is allowed to edit metadata on Opensea.

This logic is NOT used internally by the Unlock Protocol and is made
available only as a convenience helper.

### setOwner

```solidity
function setOwner(address account) external
```

### isOwner

```solidity
function isOwner(address account) external returns (bool)
```

### migrate

```solidity
function migrate(bytes _calldata) external
```

Migrate data from the previous single owner => key mapping to
the new data structure w multiple tokens.

_when all record schemas are sucessfully upgraded, this function will update the `schemaVersion`
variable to the latest/current lock version_

#### Parameters

| Name       | Type  | Description                                                                                   |
| ---------- | ----- | --------------------------------------------------------------------------------------------- |
| \_calldata | bytes | an ABI-encoded representation of the params (v10: the number of records to migrate as `uint`) |

### schemaVersion

```solidity
function schemaVersion() external view returns (uint256)
```

Returns the version number of the data schema currently used by the lock
if this is different from `publicLockVersion`, then the ability to purchase, grant
or extend keys is disabled.

_will return 0 if no ;igration has ever been run_

### updateSchemaVersion

```solidity
function updateSchemaVersion() external
```

Set the schema version to the latest
only lock manager call call this

### renewMembershipFor

```solidity
function renewMembershipFor(uint256 _tokenId, address _referrer) external
```

Renew a given token
only works for non-free, expiring, ERC20 locks

#### Parameters

| Name       | Type    | Description                                 |
| ---------- | ------- | ------------------------------------------- |
| \_tokenId  | uint256 | the ID fo the token to renew                |
| \_referrer | address | the address of the person to be granted UDT |
