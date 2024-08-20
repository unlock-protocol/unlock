# PublicLock (v14)

> The PublicLock Interface

## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32 role)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| role | bytes32 | undefined   |

### addLockManager

```solidity
function addLockManager(address account) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| to      | address | undefined   |
| tokenId | uint256 | undefined   |

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256 balance)
```

In the specific case of a Lock, `balanceOf` returns only the tokens with a valid expiration timerange

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_owner | address | undefined   |

#### Returns

| Name    | Type    | Description                                   |
| ------- | ------- | --------------------------------------------- |
| balance | uint256 | The number of valid keys owned by `_keyOwner` |

### burn

```solidity
function burn(uint256 _tokenId) external nonpayable
```

Deactivate an existing keythe key will be expired and ownership records will be destroyed

#### Parameters

| Name      | Type    | Description             |
| --------- | ------- | ----------------------- |
| \_tokenId | uint256 | the id of token to burn |

### cancelAndRefund

```solidity
function cancelAndRefund(uint256 _tokenId) external nonpayable
```

cancel is enabled with a 10% penalty by default on all Locks.

_allows the key manager to expire a given tokenId and send a refund to the keyOwner based on the amount of time remaining._

#### Parameters

| Name      | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| \_tokenId | uint256 | The id of the key to cancel. |

### expirationDuration

```solidity
function expirationDuration() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### expireAndRefundFor

```solidity
function expireAndRefundFor(uint256 _tokenId, uint256 _amount) external nonpayable
```

_Invoked by a Lock manager to expire the user&#39;s key and perform a refund and cancellation of the keyThrows if called by other than a Lock managerThrows if \_keyOwner does not have a valid key_

#### Parameters

| Name      | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| \_tokenId | uint256 | The key id we wish to refund to       |
| \_amount  | uint256 | The amount to refund to the key-owner |

### extend

```solidity
function extend(uint256 _value, uint256 _tokenId, address _referrer, bytes _data) external payable
```

_Extend functionThrows if lock is disabled or key does not exist for \_recipient. Throws if \_recipient == address(0)._

#### Parameters

| Name       | Type    | Description                                                                                                                            |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| \_value    | uint256 | the number of tokens to pay for this purchase &gt;= the current keyPrice - any applicable discount (\_value is ignored when using ETH) |
| \_tokenId  | uint256 | the id of the key to extend                                                                                                            |
| \_referrer | address | address of the user making the referral                                                                                                |
| \_data     | bytes   | arbitrary data populated by the front-end which initiated the sale                                                                     |

### freeTrialLength

```solidity
function freeTrialLength() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### gasRefundValue

```solidity
function gasRefundValue() external view returns (uint256 _gasRefundValue)
```

\_gasRefundValue price in wei or token in smallest price unit

_Returns the value/price to be refunded to the sender on purchase_

#### Returns

| Name             | Type    | Description |
| ---------------- | ------- | ----------- |
| \_gasRefundValue | uint256 | undefined   |

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

#### Returns

| Name     | Type    | Description                                                             |
| -------- | ------- | ----------------------------------------------------------------------- |
| operator | address | The approved address for this NFT, or the zero address if there is none |

### getCancelAndRefundValue

```solidity
function getCancelAndRefundValue(uint256 _tokenId) external view returns (uint256 refund)
```

Due to the time required to mine a tx, the actual refund amount will be lower than what the user reads from this call.

_Determines how much of a refund a key owner would receive if they issued_

#### Parameters

| Name      | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| \_tokenId | uint256 | the id of the token to get the refund value for. |

#### Returns

| Name   | Type    | Description                   |
| ------ | ------- | ----------------------------- |
| refund | uint256 | the amount of tokens refunded |

### getHasValidKey

```solidity
function getHasValidKey(address _user) external view returns (bool)
```

Checks if the user has a non-expired key.

#### Parameters

| Name   | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| \_user | address | The address of the key owner |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

Innherited from Open Zeppelin AccessControl.sol

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| role | bytes32 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### getTransferFee

```solidity
function getTransferFee(uint256 _tokenId, uint256 _time) external view returns (uint256)
```

Determines how much of a fee would need to be paid in order to transfer to another account. This is pro-rated so the fee goes down overtime.

_Throws if \_tokenId does not have a valid key_

#### Parameters

| Name      | Type    | Description                                   |
| --------- | ------- | --------------------------------------------- |
| \_tokenId | uint256 | The id of the key check the transfer fee for. |
| \_time    | uint256 | The amount of time to calculate the fee for.  |

#### Returns

| Name | Type    | Description                  |
| ---- | ------- | ---------------------------- |
| \_0  | uint256 | The transfer fee in seconds. |

### grantKeyExtension

```solidity
function grantKeyExtension(uint256 _tokenId, uint256 _duration) external nonpayable
```

Allows the Lock owner to extend an existing keys with no charge.

_set `_duration` to 0 to use the default duration of the lock_

#### Parameters

| Name       | Type    | Description                                |
| ---------- | ------- | ------------------------------------------ |
| \_tokenId  | uint256 | The id of the token to extend              |
| \_duration | uint256 | The duration in secondes to add ot the key |

### grantKeys

```solidity
function grantKeys(address[] _recipients, uint256[] _expirationTimestamps, address[] _keyManagers) external nonpayable returns (uint256[])
```

Allows a Lock manager to give a collection of users a key with no charge. Each key may be assigned a different expiration date.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                   | Type      | Description                                                  |
| ---------------------- | --------- | ------------------------------------------------------------ |
| \_recipients           | address[] | An array of receiving addresses                              |
| \_expirationTimestamps | uint256[] | An array of expiration Timestamps for the keys being granted |
| \_keyManagers          | address[] | undefined                                                    |

#### Returns

| Name | Type      | Description                   |
| ---- | --------- | ----------------------------- |
| \_0  | uint256[] | the ids of the granted tokens |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### initialize

```solidity
function initialize(address _lockCreator, uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName) external nonpayable
```

Functions

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| \_lockCreator        | address | undefined   |
| \_expirationDuration | uint256 | undefined   |
| \_tokenAddress       | address | undefined   |
| \_keyPrice           | uint256 | undefined   |
| \_maxNumberOfKeys    | uint256 | undefined   |
| \_lockName           | string  | undefined   |

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

#### Returns

| Name | Type | Description                                                    |
| ---- | ---- | -------------------------------------------------------------- |
| \_0  | bool | bool whether the given operator is approved by the given owner |

### isLockManager

```solidity
function isLockManager(address account) external view returns (bool)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### isOwner

```solidity
function isOwner(address account) external view returns (bool isOwner)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

#### Returns

| Name    | Type | Description |
| ------- | ---- | ----------- |
| isOwner | bool | undefined   |

### isRenewable

```solidity
function isRenewable(uint256 tokenId, address referrer) external view returns (bool)
```

_helper to check if a key is currently renewable it will revert if the pricing or duration of the lock have been modified unfavorably since the key was bought(price increase or duration decrease). It will also revert if a lock is not renewable or if the key is not ready for renewal yet (at least 90% expired)._

#### Parameters

| Name     | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| tokenId  | uint256 | the id of the token to check               |
| referrer | address | the address where to send the referrer fee |

#### Returns

| Name | Type | Description                   |
| ---- | ---- | ----------------------------- |
| \_0  | bool | true if the terms has changed |

### isValidKey

```solidity
function isValidKey(uint256 _tokenId) external view returns (bool)
```

Check if a certain key is validthis makes use of the onValidKeyHook if it is set

#### Parameters

| Name      | Type    | Description                         |
| --------- | ------- | ----------------------------------- |
| \_tokenId | uint256 | the id of the key to check validity |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### keyExpirationTimestampFor

```solidity
function keyExpirationTimestampFor(uint256 _tokenId) external view returns (uint256 timestamp)
```

_Returns the key&#39;s ExpirationTimestamp field for a given owner.Returns 0 if the owner has never owned a key for this lock_

#### Parameters

| Name      | Type    | Description       |
| --------- | ------- | ----------------- |
| \_tokenId | uint256 | the id of the key |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| timestamp | uint256 | undefined   |

### keyManagerOf

```solidity
function keyManagerOf(uint256) external view returns (address)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### keyPrice

```solidity
function keyPrice() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### lendKey

```solidity
function lendKey(address from, address to, uint256 tokenId) external nonpayable
```

Lending a key allows you to transfer the token while retaining the ownerships right by setting yourself as a key manager first.This function can only be called by 1) the key owner when no key manager is set or 2) the key manager. After calling the function, the `_recipent` will be the new owner, and the sender of the tx will become the key manager.

#### Parameters

| Name    | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| from    | address | the owner of token to transfer          |
| to      | address | the address that will receive the token |
| tokenId | uint256 | the id of the token                     |

### maxKeysPerAddress

```solidity
function maxKeysPerAddress() external view returns (uint256)
```

#### Returns

| Name | Type    | Description                                            |
| ---- | ------- | ------------------------------------------------------ |
| \_0  | uint256 | the maximum number of key allowed for a single address |

### maxNumberOfKeys

```solidity
function maxNumberOfKeys() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### mergeKeys

```solidity
function mergeKeys(uint256 _tokenIdFrom, uint256 _tokenIdTo, uint256 _amount) external nonpayable
```

Merge existing keys

#### Parameters

| Name          | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| \_tokenIdFrom | uint256 | the id of the token to substract time from  |
| \_tokenIdTo   | uint256 | the id of the destination token to add time |
| \_amount      | uint256 | the amount of time to transfer (in seconds) |

### migrate

```solidity
function migrate(bytes _calldata) external nonpayable
```

Migrate data from the previous single owner =&gt; key mapping to the new data structure w multiple tokens.

_when all record schemas are sucessfully upgraded, this function will update the `schemaVersion` variable to the latest/current lock version_

#### Parameters

| Name       | Type  | Description                                                                                   |
| ---------- | ----- | --------------------------------------------------------------------------------------------- |
| \_calldata | bytes | an ABI-encoded representation of the params (v10: the number of records to migrate as `uint`) |

### name

```solidity
function name() external view returns (string _name)
```

A descriptive name for a collection of NFTs in this contract

#### Returns

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| \_name | string | undefined   |

### numberOfOwners

```solidity
function numberOfOwners() external view returns (uint256)
```

Public function which returns the total number of unique owners (both expired and valid). This may be larger than totalSupply.

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### onKeyCancelHook

```solidity
function onKeyCancelHook() external view returns (address hookAddress)
```

Returns the address of the `onKeyCancelHook` hook.

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| hookAddress | address | address of the hook |

### onKeyExtendHook

```solidity
function onKeyExtendHook() external view returns (address hookAddress)
```

Returns the address of the `onKeyExtendHook` hook.

#### Returns

| Name        | Type    | Description             |
| ----------- | ------- | ----------------------- |
| hookAddress | address | the address ok the hook |

### onKeyGrantHook

```solidity
function onKeyGrantHook() external view returns (address hookAddress)
```

Returns the address of the `onKeyGrantHook` hook.

#### Returns

| Name        | Type    | Description             |
| ----------- | ------- | ----------------------- |
| hookAddress | address | the address ok the hook |

### onKeyPurchaseHook

```solidity
function onKeyPurchaseHook() external view returns (address hookAddress)
```

Returns the address of the `onKeyPurchaseHook` hook.

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| hookAddress | address | address of the hook |

### onKeyTransferHook

```solidity
function onKeyTransferHook() external view returns (address hookAddress)
```

Returns the address of the `onKeyTransferHook` hook.

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| hookAddress | address | address of the hook |

### onTokenURIHook

```solidity
function onTokenURIHook() external view returns (address hookAddress)
```

Returns the address of the `onTokenURIHook` hook.

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| hookAddress | address | address of the hook |

### onValidKeyHook

```solidity
function onValidKeyHook() external view returns (address hookAddress)
```

Returns the address of the `onValidKeyHook` hook.

#### Returns

| Name        | Type    | Description         |
| ----------- | ------- | ------------------- |
| hookAddress | address | address of the hook |

### owner

```solidity
function owner() external view returns (address owner)
```

`owner()` is provided as an helper to mimick the `Ownable` contract ABI. The `Ownable` logic is used by many 3rd party services to determine contract ownership - e.g. who is allowed to edit metadata on Opensea.This logic is NOT used internally by the Unlock Protocol and is made available only as a convenience helper.

#### Returns

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| owner | address | undefined   |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address _owner)
```

_Returns the owner of the NFT specified by `tokenId`._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| tokenId | uint256 | undefined   |

#### Returns

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_owner | address | undefined   |

### publicLockVersion

```solidity
function publicLockVersion() external pure returns (uint16)
```

The version number of the current implementation on this network.

#### Returns

| Name | Type   | Description                 |
| ---- | ------ | --------------------------- |
| \_0  | uint16 | The current version number. |

### purchase

```solidity
function purchase(uint256[] _values, address[] _recipients, address[] _referrers, address[] _keyManagers, bytes[] _data) external payable returns (uint256[] tokenIds)
```

when called for an existing and non-expired key, the `_keyManager` param will be ignored

_Purchase functionSetting \_value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the price while my transaction is pending I can&#39;t be charged more than I expected (only applicable to ERC-20 when more than keyPrice is approved for spending)._

#### Parameters

| Name          | Type      | Description                                                                                                                               |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| \_values      | uint256[] | array of tokens amount to pay for this purchase &gt;= the current keyPrice - any applicable discount (\_values is ignored when using ETH) |
| \_recipients  | address[] | array of addresses of the recipients of the purchased key                                                                                 |
| \_referrers   | address[] | array of addresses of the users making the referral                                                                                       |
| \_keyManagers | address[] | optional array of addresses to grant managing rights to a specific address on creation                                                    |
| \_data        | bytes[]   | array of arbitrary data populated by the front-end which initiated the sale                                                               |

#### Returns

| Name     | Type      | Description                   |
| -------- | --------- | ----------------------------- |
| tokenIds | uint256[] | the ids of the created tokens |

### purchasePriceFor

```solidity
function purchasePriceFor(address _recipient, address _referrer, bytes _data) external view returns (uint256)
```

returns the minimum price paid for a purchase with these params.

_this considers any discount from Unlock or the OnKeyPurchase hook._

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| \_recipient | address | undefined   |
| \_referrer  | address | undefined   |
| \_data      | bytes   | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### referrerFees

```solidity
function referrerFees(address _referrer) external view returns (uint256 referrerFee)
```

Returns the percentage of the keyPrice to be sent to the referrer (in basis points)

#### Parameters

| Name       | Type    | Description                 |
| ---------- | ------- | --------------------------- |
| \_referrer | address | the address of the referrer |

#### Returns

| Name        | Type    | Description                                                                 |
| ----------- | ------- | --------------------------------------------------------------------------- |
| referrerFee | uint256 | the percentage of the keyPrice to be sent to the referrer (in basis points) |

### refundPenaltyBasisPoints

```solidity
function refundPenaltyBasisPoints() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### renewMembershipFor

```solidity
function renewMembershipFor(uint256 _tokenId, address _referrer) external nonpayable
```

Renew a given tokenonly works for non-free, expiring, ERC20 locks

#### Parameters

| Name       | Type    | Description                                 |
| ---------- | ------- | ------------------------------------------- |
| \_tokenId  | uint256 | the ID fo the token to renew                |
| \_referrer | address | the address of the person to be granted UDT |

### renounceLockManager

```solidity
function renounceLockManager() external nonpayable
```

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| role    | bytes32 | undefined   |
| account | address | undefined   |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```

_Transfers a specific NFT (`tokenId`) from one account (`from`) to another (`to`). Requirements: - `from`, `to` cannot be zero. - `tokenId` must be owned by `from`. - If the caller is not `from`, it must be have been allowed to move this NFT by either `approve` or `setApprovalForAll`._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| from    | address | undefined   |
| to      | address | undefined   |
| tokenId | uint256 | undefined   |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| from    | address | undefined   |
| to      | address | undefined   |
| tokenId | uint256 | undefined   |
| data    | bytes   | undefined   |

### schemaVersion

```solidity
function schemaVersion() external view returns (uint256)
```

Returns the version number of the data schema currently used by the lockif this is different from `publicLockVersion`, then the ability to purchase, grant or extend keys is disabled.

_will return 0 if no ;igration has ever been run_

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### setApprovalForAll

```solidity
function setApprovalForAll(address _operator, bool _approved) external nonpayable
```

disabled when transfers are disabled

_Sets or unsets the approval of a given operator An operator is allowed to transfer all tokens of the sender on their behalf_

#### Parameters

| Name       | Type    | Description                                       |
| ---------- | ------- | ------------------------------------------------- |
| \_operator | address | operator address to set the approval              |
| \_approved | bool    | representing the status of the approval to be set |

### setEventHooks

```solidity
function setEventHooks(address _onKeyPurchaseHook, address _onKeyCancelHook, address _onValidKeyHook, address _onTokenURIHook, address _onKeyTransferHook, address _onKeyExtendHook, address _onKeyGrantHook) external nonpayable
```

Allows a Lock manager to add or remove an event hook

#### Parameters

| Name                | Type    | Description                                                                            |
| ------------------- | ------- | -------------------------------------------------------------------------------------- |
| \_onKeyPurchaseHook | address | Hook called when the `purchase` function is called                                     |
| \_onKeyCancelHook   | address | Hook called when the internal `_cancelAndRefund` function is called                    |
| \_onValidKeyHook    | address | Hook called to determine if the contract should overide the status for a given address |
| \_onTokenURIHook    | address | Hook called to generate a data URI used for NFT metadata                               |
| \_onKeyTransferHook | address | Hook called when a key is transfered                                                   |
| \_onKeyExtendHook   | address | Hook called when a key is extended or renewed                                          |
| \_onKeyGrantHook    | address | Hook called when a key is granted                                                      |

### setGasRefundValue

```solidity
function setGasRefundValue(uint256 _gasRefundValue) external nonpayable
```

_Set the value to be refunded to the sender on purchase_

#### Parameters

| Name             | Type    | Description                                  |
| ---------------- | ------- | -------------------------------------------- |
| \_gasRefundValue | uint256 | price in wei or token in smallest price unit |

### setKeyExpiration

```solidity
function setKeyExpiration(uint256 _tokenId, uint256 _newExpiration) external nonpayable
```

Set the expiration of a keyonly a lock manager can call this function

#### Parameters

| Name            | Type    | Description              |
| --------------- | ------- | ------------------------ |
| \_tokenId       | uint256 | the id of the key        |
| \_newExpiration | uint256 | the new timestamp to use |

### setKeyManagerOf

```solidity
function setKeyManagerOf(uint256 _tokenId, address _keyManager) external nonpayable
```

Update transfer and cancel rights for a given key

#### Parameters

| Name         | Type    | Description                                           |
| ------------ | ------- | ----------------------------------------------------- |
| \_tokenId    | uint256 | The id of the key to assign rights for                |
| \_keyManager | address | The address to assign the rights to for the given key |

### setLockMetadata

```solidity
function setLockMetadata(string _lockName, string _lockSymbol, string _baseTokenURI) external nonpayable
```

Allows the Lock owner to assign

#### Parameters

| Name           | Type   | Description                              |
| -------------- | ------ | ---------------------------------------- |
| \_lockName     | string | a descriptive name for this Lock.        |
| \_lockSymbol   | string | a Symbol for this Lock (default to KEY). |
| \_baseTokenURI | string | the baseTokenURI for this Lock           |

### setOwner

```solidity
function setOwner(address account) external nonpayable
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| account | address | undefined   |

### setReferrerFee

```solidity
function setReferrerFee(address _referrer, uint256 _feeBasisPoint) external nonpayable
```

Set a specific percentage of the keyPrice to be sent to the referrer while purchasing, extending or renewing a key.

_To send a fixed percentage of the key price to all referrers, sett a percentage to `address(0)`_

#### Parameters

| Name            | Type    | Description                                                                         |
| --------------- | ------- | ----------------------------------------------------------------------------------- |
| \_referrer      | address | the address of the referrer                                                         |
| \_feeBasisPoint | uint256 | the percentage of the price to be used for this specific referrer (in basis points) |

### shareKey

```solidity
function shareKey(address _to, uint256 _tokenId, uint256 _timeShared) external nonpayable
```

Allows the key owner to safely share their key (parent key) by transferring a portion of the remaining time to a new key (child key).

_Throws if key is not valid.Throws if `_to` is the zero addressEmit Transfer event_

#### Parameters

| Name         | Type    | Description                                                                                                                                                                                                                                      |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| \_to         | address | The recipient of the shared key                                                                                                                                                                                                                  |
| \_tokenId    | uint256 | the key to share                                                                                                                                                                                                                                 |
| \_timeShared | uint256 | The amount of time shared checks if `_to` is a smart contract (code size &gt; 0). If so, it calls `onERC721Received` on `_to` and throws if the return value is not `bytes4(keccak256(&#39;onERC721Received(address,address,uint,bytes)&#39;))`. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

From ERC165.sol

#### Parameters

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| interfaceId | bytes4 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### symbol

```solidity
function symbol() external view returns (string)
```

_Gets the token symbol_

#### Returns

| Name | Type   | Description                          |
| ---- | ------ | ------------------------------------ |
| \_0  | string | string representing the token symbol |

### tokenAddress

```solidity
function tokenAddress() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### tokenByIndex

```solidity
function tokenByIndex(uint256 index) external view returns (uint256)
```

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| index | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### tokenOfOwnerByIndex

```solidity
function tokenOfOwnerByIndex(address _owner, uint256 index) external view returns (uint256 tokenId)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| \_owner | address | undefined   |
| index   | uint256 | undefined   |

#### Returns

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| tokenId | uint256 | undefined   |

### tokenURI

```solidity
function tokenURI(uint256 _tokenId) external view returns (string)
```

A distinct Uniform Resource Identifier (URI) for a given asset.

_Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC 3986. The URI may point to a JSON file that conforms to the &quot;ERC721 Metadata JSON Schema&quot;. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md_

#### Parameters

| Name      | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| \_tokenId | uint256 | The tokenID we&#39;re inquiring about |

#### Returns

| Name | Type   | Description                                         |
| ---- | ------ | --------------------------------------------------- |
| \_0  | string | String representing the URI for the requested token |

### totalKeys

```solidity
function totalKeys(address _keyOwner) external view returns (uint256 numberOfKeys)
```

Returns the number of keys owned by `_keyOwner` (expired or not)

#### Parameters

| Name       | Type    | Description                                                  |
| ---------- | ------- | ------------------------------------------------------------ |
| \_keyOwner | address | address for which we are retrieving the total number of keys |

#### Returns

| Name         | Type    | Description                               |
| ------------ | ------- | ----------------------------------------- |
| numberOfKeys | uint256 | total number of keys owned by the address |

### totalSupply

```solidity
function totalSupply() external view returns (uint256 _totalKeysCreated)
```

Returns the total number of keys, including non-valid ones

#### Returns

| Name               | Type    | Description                            |
| ------------------ | ------- | -------------------------------------- |
| \_totalKeysCreated | uint256 | the total number of keys, valid or not |

### transferFeeBasisPoints

```solidity
function transferFeeBasisPoints() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```

an ERC721-like function to transfer a token from one account to another.

_Requirements: if the caller is not `from`, it must be approved to move this token by either `approve` or `setApprovalForAll`. The key manager will be reset to address zero after the transfer_

#### Parameters

| Name    | Type    | Description                             |
| ------- | ------- | --------------------------------------- |
| from    | address | the owner of token to transfer          |
| to      | address | the address that will receive the token |
| tokenId | uint256 | the id of the token                     |

### unlendKey

```solidity
function unlendKey(address _recipient, uint256 _tokenId) external nonpayable
```

Unlend is called when you have lent a key and want to claim its full ownership back.

_Only the key manager of the token can call this function_

#### Parameters

| Name        | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| \_recipient | address | the address that will receive the token ownership |
| \_tokenId   | uint256 | the id of the token                               |

### unlockProtocol

```solidity
function unlockProtocol() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### updateKeyPricing

```solidity
function updateKeyPricing(uint256 _keyPrice, address _tokenAddress) external nonpayable
```

A function which lets a Lock manager of the lock to change the price for future purchases.

_Throws if called by other than a Lock managerThrows if lock has been disabledThrows if \_tokenAddress is not a valid token_

#### Parameters

| Name           | Type    | Description                                                                 |
| -------------- | ------- | --------------------------------------------------------------------------- |
| \_keyPrice     | uint256 | The new price to set for keys                                               |
| \_tokenAddress | address | The address of the erc20 token to use for pricing the keys, or 0 to use ETH |

### updateLockConfig

```solidity
function updateLockConfig(uint256 _newExpirationDuration, uint256 _maxNumberOfKeys, uint256 _maxKeysPerAcccount) external nonpayable
```

Update the main key properties for the entire lock: - default duration of each key - the maximum number of keys the lock can edit - the maximum number of keys a single address can holdkeys previously bought are unaffected by this changes in expiration duration (i.e. existing keys timestamps are not recalculated/updated)

_\_maxNumberOfKeys Can&#39;t be smaller than the existing supply_

#### Parameters

| Name                    | Type    | Description                                                                            |
| ----------------------- | ------- | -------------------------------------------------------------------------------------- |
| \_newExpirationDuration | uint256 | the new amount of time for each key purchased or type(uint).max for a non-expiring key |
| \_maxNumberOfKeys       | uint256 | uint the maximum number of keys                                                        |
| \_maxKeysPerAcccount    | uint256 | the maximum amount of key a single user can own                                        |

### updateRefundPenalty

```solidity
function updateRefundPenalty(uint256 _freeTrialLength, uint256 _refundPenaltyBasisPoints) external nonpayable
```

Allow a Lock manager to change the refund penalty.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| \_freeTrialLength          | uint256 | The new duration of free trials for this lock |
| \_refundPenaltyBasisPoints | uint256 | The new refund penaly in basis-points(bps)    |

### updateSchemaVersion

```solidity
function updateSchemaVersion() external nonpayable
```

Set the schema version to the latestonly lock manager call call this

### updateTransferFee

```solidity
function updateTransferFee(uint256 _transferFeeBasisPoints) external nonpayable
```

Allow a Lock manager to change the transfer fee.

_Throws if called by other than a Lock manager_

#### Parameters

| Name                     | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| \_transferFeeBasisPoints | uint256 | The new transfer fee in basis-points(bps). Ex: 200 bps = 2% |

### withdraw

```solidity
function withdraw(address _tokenAddress, address payable _recipient, uint256 _amount) external nonpayable
```

_Called by lock manager to withdraw all funds from the lock_

#### Parameters

| Name           | Type            | Description                                                                                                                                                                                                                                                 |
| -------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_tokenAddress | address         | specifies the token address to withdraw or 0 for ETH. This is usually the same as `tokenAddress` in MixinFunds.                                                                                                                                             |
| \_recipient    | address payable | specifies the address that will receive the tokens                                                                                                                                                                                                          |
| \_amount       | uint256         | specifies the max amount to withdraw, which may be reduced when considering the available balance. Set to 0 or MAX_UINT to withdraw everything. -- however be wary of draining funds as it breaks the `cancelAndRefund` and `expireAndRefundFor` use cases. |
