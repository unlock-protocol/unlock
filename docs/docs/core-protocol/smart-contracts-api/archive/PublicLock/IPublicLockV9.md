# IPublicLockV9



> The PublicLock Interface





## Methods

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external pure returns (bytes32 role)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

### KEY_GRANTER_ROLE

```solidity
function KEY_GRANTER_ROLE() external pure returns (bytes32 role)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

### LOCK_MANAGER_ROLE

```solidity
function LOCK_MANAGER_ROLE() external pure returns (bytes32 role)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

### addKeyGranter

```solidity
function addKeyGranter(address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

### addLockManager

```solidity
function addLockManager(address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### approveBeneficiary

```solidity
function approveBeneficiary(address _spender, uint256 _amount) external nonpayable returns (bool)
```

An ERC-20 style approval, allowing the spender to transfer funds directly from this lock.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _spender | address | address that can spend tokens belonging to the lock |
| _amount | uint256 | amount of tokens that can be spent by the spender |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256 balance)
```



*Returns the number of NFTs in `owner`&#39;s account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| balance | uint256 | undefined |

### beneficiary

```solidity
function beneficiary() external view returns (address)
```

=================================================================== Auto-generated getter functions from public state variables




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### cancelAndRefund

```solidity
function cancelAndRefund(uint256 _tokenId) external nonpayable
```



*allows the key manager to expire a given tokenId and send a refund to the keyOwner based on the amount of time remaining.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The id of the key to cancel. |

### disableLock

```solidity
function disableLock() external nonpayable
```

Used to disable lock before migrating keys and/or destroying contract.

*Throws if called by other than a lock manager.Throws if lock contract has already been disabled.*


### expirationDuration

```solidity
function expirationDuration() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### expireAndRefundFor

```solidity
function expireAndRefundFor(address _keyOwner, uint256 amount) external nonpayable
```



*Invoked by a Lock manager to expire the user&#39;s key and perform a refund and cancellation of the keyThrows if called by other than a Lock managerThrows if _keyOwner does not have a valid key*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | The key owner to whom we wish to send a refund to |
| amount | uint256 | The amount to refund the key-owner |

### freeTrialLength

```solidity
function freeTrialLength() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### gasRefundValue

```solidity
function gasRefundValue() external view returns (uint256 _gasRefundValue)
```

_gasRefundValue price in wei or token in smallest price unit

*Returns the value/rpice to be refunded to the sender on purchase*


#### Returns

| Name | Type | Description |
|---|---|---|
| _gasRefundValue | uint256 | undefined |

### getApproved

```solidity
function getApproved(uint256 _tokenId) external view returns (address operator)
```

Get the approved address for a single NFT

*Throws if `_tokenId` is not a valid NFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The NFT to find the approved address for |

#### Returns

| Name | Type | Description |
|---|---|---|
| operator | address | The approved address for this NFT, or the zero address if there is none |

### getCancelAndRefundValueFor

```solidity
function getCancelAndRefundValueFor(address _keyOwner) external view returns (uint256 refund)
```



*Determines how much of a refund a key owner would receive if they issued*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | The key owner to get the refund value for. a cancelAndRefund block.timestamp. Note that due to the time required to mine a tx, the actual refund amount will be lower than what the user reads from this call. |

#### Returns

| Name | Type | Description |
|---|---|---|
| refund | uint256 | undefined |

### getHasValidKey

```solidity
function getHasValidKey(address _user) external view returns (bool)
```

Checks if the user has a non-expired key.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _user | address | The address of the key owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```

Innherited from Open Zeppelin AccessControl.sol



#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### getTokenIdFor

```solidity
function getTokenIdFor(address _account) external view returns (uint256)
```

Find the tokenId for a given user



#### Parameters

| Name | Type | Description |
|---|---|---|
| _account | address | The address of the key owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The tokenId of the NFT, else returns 0 |

### getTransferFee

```solidity
function getTransferFee(address _keyOwner, uint256 _time) external view returns (uint256)
```

Determines how much of a fee a key owner would need to pay in order to transfer the key to another account.  This is pro-rated so the fee goes down overtime.

*Throws if _keyOwner does not have a valid key*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | The owner of the key check the transfer fee for. |
| _time | uint256 | The amount of time to calculate the fee for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The transfer fee in seconds. |

### grantKeys

```solidity
function grantKeys(address[] _recipients, uint256[] _expirationTimestamps, address[] _keyManagers) external nonpayable
```

Allows a Lock manager to give a collection of users a key with no charge. Each key may be assigned a different expiration date.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipients | address[] | An array of receiving addresses |
| _expirationTimestamps | uint256[] | An array of expiration Timestamps for the keys being granted |
| _keyManagers | address[] | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### initialize

```solidity
function initialize(address _lockCreator, uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName) external nonpayable
```

Functions



#### Parameters

| Name | Type | Description |
|---|---|---|
| _lockCreator | address | undefined |
| _expirationDuration | uint256 | undefined |
| _tokenAddress | address | undefined |
| _keyPrice | uint256 | undefined |
| _maxNumberOfKeys | uint256 | undefined |
| _lockName | string | undefined |

### isAlive

```solidity
function isAlive() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address _owner, address operator) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isKeyGranter

```solidity
function isKeyGranter(address account) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isLockManager

```solidity
function isLockManager(address account) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### keyExpirationTimestampFor

```solidity
function keyExpirationTimestampFor(address _keyOwner) external view returns (uint256 timestamp)
```



*Returns the key&#39;s ExpirationTimestamp field for a given owner.Returns 0 if the owner has never owned a key for this lock*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | address of the user for whom we search the key |

#### Returns

| Name | Type | Description |
|---|---|---|
| timestamp | uint256 | undefined |

### keyManagerOf

```solidity
function keyManagerOf(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### keyPrice

```solidity
function keyPrice() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### maxNumberOfKeys

```solidity
function maxNumberOfKeys() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### name

```solidity
function name() external view returns (string _name)
```

A descriptive name for a collection of NFTs in this contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _name | string | undefined |

### numberOfOwners

```solidity
function numberOfOwners() external view returns (uint256)
```

Public function which returns the total number of unique owners (both expired and valid).  This may be larger than totalSupply.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### onKeyCancelHook

```solidity
function onKeyCancelHook() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### onKeyPurchaseHook

```solidity
function onKeyPurchaseHook() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### onTokenURIHook

```solidity
function onTokenURIHook() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### onValidKeyHook

```solidity
function onValidKeyHook() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address _owner)
```



*Returns the owner of the NFT specified by `tokenId`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |

### publicLockVersion

```solidity
function publicLockVersion() external pure returns (uint16)
```

The version number of the current implementation on this network.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16 | The current version number. |

### purchase

```solidity
function purchase(uint256 _value, address _recipient, address _referrer, address _keyManager, bytes _data) external payable
```



*Purchase functionThrows if lock is disabled. Throws if lock is sold-out. Throws if _recipient == address(0).Setting _value to keyPrice exactly doubles as a security feature. That way if a Lock manager increases the price while my transaction is pending I can&#39;t be charged more than I expected (only applicable to ERC-20 when more than keyPrice is approved for spending).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _value | uint256 | the number of tokens to pay for this purchase &gt;= the current keyPrice - any applicable discount (_value is ignored when using ETH) |
| _recipient | address | address of the recipient of the purchased key |
| _referrer | address | address of the user making the referral |
| _keyManager | address | optional address to grant managing rights to a specific address on creation |
| _data | bytes | arbitrary data populated by the front-end which initiated the sale |

### purchasePriceFor

```solidity
function purchasePriceFor(address _recipient, address _referrer, bytes _data) external view returns (uint256)
```

returns the minimum price paid for a purchase with these params.

*this considers any discount from Unlock or the OnKeyPurchase hook.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipient | address | undefined |
| _referrer | address | undefined |
| _data | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### refundPenaltyBasisPoints

```solidity
function refundPenaltyBasisPoints() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### renounceLockManager

```solidity
function renounceLockManager() external nonpayable
```






### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeKeyGranter

```solidity
function revokeKeyGranter(address _granter) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _granter | address | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Transfers a specific NFT (`tokenId`) from one account (`from`) to another (`to`). Requirements: - `from`, `to` cannot be zero. - `tokenId` must be owned by `from`. - If the caller is not `from`, it must be have been allowed to move this NFT by either {approve} or {setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool _approved) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| _approved | bool | undefined |

### setBaseTokenURI

```solidity
function setBaseTokenURI(string _baseTokenURI) external nonpayable
```

Allows a Lock manager to update the baseTokenURI for this Lock.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _baseTokenURI | string | String representing the base of the URI for this lock. |

### setEventHooks

```solidity
function setEventHooks(address _onKeyPurchaseHook, address _onKeyCancelHook, address _onValidKeyHook, address _onTokenURIHook) external nonpayable
```

Allows a Lock manager to add or remove an event hook



#### Parameters

| Name | Type | Description |
|---|---|---|
| _onKeyPurchaseHook | address | Hook called when the `purchase` function is called |
| _onKeyCancelHook | address | Hook called when the internal `_cancelAndRefund` function is called |
| _onValidKeyHook | address | Hook called to determine if the contract should overide the status for a given address |
| _onTokenURIHook | address | Hook called to generate a data URI used for NFT metadata |

### setExpirationDuration

```solidity
function setExpirationDuration(uint256 _newExpirationDuration) external nonpayable
```

A function to change the default duration of each key in the lockkeys previously bought are unaffected by this change (i.e. existing keys timestamps are not recalculated/updated)



#### Parameters

| Name | Type | Description |
|---|---|---|
| _newExpirationDuration | uint256 | the new amount of time for each key purchased  or zero (0) for a non-expiring key |

### setGasRefundValue

```solidity
function setGasRefundValue(uint256 _gasRefundValue) external nonpayable
```



*Set the value to be refunded to the sender on purchase*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _gasRefundValue | uint256 | price in wei or token in smallest price unit |

### setKeyManagerOf

```solidity
function setKeyManagerOf(uint256 _tokenId, address _keyManager) external nonpayable
```

Update transfer and cancel rights for a given key



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The id of the key to assign rights for |
| _keyManager | address | The address to assign the rights to for the given key |

### setMaxNumberOfKeys

```solidity
function setMaxNumberOfKeys(uint256 _maxNumberOfKeys) external nonpayable
```



*Change the maximum number of keys the lock can edit*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _maxNumberOfKeys | uint256 | uint the maximum number of keys |

### shareKey

```solidity
function shareKey(address _to, uint256 _tokenId, uint256 _timeShared) external nonpayable
```

Allows the key owner to safely share their key (parent key) by transferring a portion of the remaining time to a new key (child key).

*Throws if key is not valid.Throws if `_to` is the zero addressEmit Transfer event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address | The recipient of the shared key |
| _tokenId | uint256 | the key to share |
| _timeShared | uint256 | The amount of time shared checks if `_to` is a smart contract (code size &gt; 0). If so, it calls `onERC721Received` on `_to` and throws if the return value is not `bytes4(keccak256(&#39;onERC721Received(address,address,uint,bytes)&#39;))`. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

From ERC165.sol



#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*Gets the token symbol*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string representing the token symbol |

### tokenAddress

```solidity
function tokenAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### tokenByIndex

```solidity
function tokenByIndex(uint256 index) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### tokenOfOwnerByIndex

```solidity
function tokenOfOwnerByIndex(address _owner, uint256 index) external view returns (uint256 tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |
| index | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### tokenURI

```solidity
function tokenURI(uint256 _tokenId) external view returns (string)
```

A distinct Uniform Resource Identifier (URI) for a given asset.

*Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC  3986. The URI may point to a JSON file that conforms to the &quot;ERC721  Metadata JSON Schema&quot;. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The tokenID we&#39;re inquiring about |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | String representing the URI for the requested token |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transfer

```solidity
function transfer(address _to, uint256 _value) external nonpayable returns (bool success)
```

An ERC-20 style transfer.

*The typical use case would be to call this with _value 1, which is on par with calling `transferFrom`. If the user has more than `expirationDuration` time remaining this may use the `shareKey` function to send some but not all of the token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address | undefined |
| _value | uint256 | sends a token with _value * expirationDuration (the amount of time remaining on a standard purchase). |

#### Returns

| Name | Type | Description |
|---|---|---|
| success | bool | undefined |

### transferFeeBasisPoints

```solidity
function transferFeeBasisPoints() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Transfers a specific NFT (`tokenId`) from one account (`from`) to another (`to`). Requirements: - If the caller is not `from`, it must be approved to move this NFT by either {approve} or {setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### unlockProtocol

```solidity
function unlockProtocol() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### updateBeneficiary

```solidity
function updateBeneficiary(address _beneficiary) external nonpayable
```

A function which lets a Lock manager update the beneficiary account, which receives funds on withdrawal.

*Throws if called by other than a Lock manager or beneficiaryThrows if _beneficiary is address(0)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | The new address to set as the beneficiary |

### updateKeyPricing

```solidity
function updateKeyPricing(uint256 _keyPrice, address _tokenAddress) external nonpayable
```

A function which lets a Lock manager of the lock to change the price for future purchases.

*Throws if called by other than a Lock managerThrows if lock has been disabledThrows if _tokenAddress is not a valid token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyPrice | uint256 | The new price to set for keys |
| _tokenAddress | address | The address of the erc20 token to use for pricing the keys, or 0 to use ETH |

### updateLockName

```solidity
function updateLockName(string _lockName) external nonpayable
```

Allows a Lock manager to assign a descriptive name for this Lock.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _lockName | string | The new name for the lock |

### updateLockSymbol

```solidity
function updateLockSymbol(string _lockSymbol) external nonpayable
```

Allows a Lock manager to assign a Symbol for this Lock.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _lockSymbol | string | The new Symbol for the lock |

### updateRefundPenalty

```solidity
function updateRefundPenalty(uint256 _freeTrialLength, uint256 _refundPenaltyBasisPoints) external nonpayable
```

Allow a Lock manager to change the refund penalty.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _freeTrialLength | uint256 | The new duration of free trials for this lock |
| _refundPenaltyBasisPoints | uint256 | The new refund penaly in basis-points(bps) |

### updateTransferFee

```solidity
function updateTransferFee(uint256 _transferFeeBasisPoints) external nonpayable
```

Allow a Lock manager to change the transfer fee.

*Throws if called by other than a Lock manager*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _transferFeeBasisPoints | uint256 | The new transfer fee in basis-points(bps). Ex: 200 bps = 2% |

### withdraw

```solidity
function withdraw(address _tokenAddress, uint256 _amount) external nonpayable
```



*Called by a lock manager or beneficiary to withdraw all funds from the lock and send them to the `beneficiary`.Throws if called by other than a lock manager or beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenAddress | address | specifies the token address to withdraw or 0 for ETH. This is usually the same as `tokenAddress` in MixinFunds. |
| _amount | uint256 | specifies the max amount to withdraw, which may be reduced when considering the available balance. Set to 0 or MAX_UINT to withdraw everything.  -- however be wary of draining funds as it breaks the `cancelAndRefund` and `expireAndRefundFor` use cases. |




