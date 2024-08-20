# IPublicLockV5

> The PublicLock Interface

## Methods

### BASIS_POINTS_DEN

```solidity
function BASIS_POINTS_DEN() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

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
function balanceOf(address owner) external view returns (uint256 balance)
```

_Returns the number of NFTs in `owner`&#39;s account._

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| owner | address | undefined   |

#### Returns

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| balance | uint256 | undefined   |

### beneficiary

```solidity
function beneficiary() external view returns (address)
```

=================================================================== Auto-generated getter functions from public state variables

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### cancelAndRefund

```solidity
function cancelAndRefund() external nonpayable
```

Destroys the msg.sender&#39;s key and sends a refund based on the amount of time remaining.

### cancelAndRefundFor

```solidity
function cancelAndRefundFor(address _keyOwner, bytes _signature) external nonpayable
```

_Cancels a key owned by a different user and sends the funds to the msg.sender._

#### Parameters

| Name        | Type    | Description                                             |
| ----------- | ------- | ------------------------------------------------------- |
| \_keyOwner  | address | this user&#39;s key will be canceled                    |
| \_signature | bytes   | getCancelAndRefundApprovalHash signed by the \_keyOwner |

### destroyLock

```solidity
function destroyLock() external nonpayable
```

Used to clean up old lock contracts from the blockchain. TODO: add a check to ensure all keys are INVALID!

_Throws if called by other than owner.Throws if lock has not yet been disabled._

### disableLock

```solidity
function disableLock() external nonpayable
```

Used to disable lock before migrating keys and/or destroying contract.

_Throws if called by other than the owner.Throws if lock contract has already been disabled._

### erc1820

```solidity
function erc1820() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### expirationDuration

```solidity
function expirationDuration() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### expireKeyFor

```solidity
function expireKeyFor(address _owner) external nonpayable
```

A function which lets the owner of the lock expire a users&#39; key.

_Throws if called by other than lock ownerThrows if key owner does not have a valid key_

#### Parameters

| Name    | Type    | Description                  |
| ------- | ------- | ---------------------------- |
| \_owner | address | The address of the key owner |

### freeTrialLength

```solidity
function freeTrialLength() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### fullRefund

```solidity
function fullRefund(address _keyOwner, uint256 amount) external nonpayable
```

_Invoked by the lock owner to destroy the user&#39;s key and perform a refund and cancellation of the keyThrows if called by other than ownerThrows if \_keyOwner does not have a valid key_

#### Parameters

| Name       | Type    | Description                                       |
| ---------- | ------- | ------------------------------------------------- |
| \_keyOwner | address | The key owner to whom we wish to send a refund to |
| amount     | uint256 | The amount to refund the key-owner                |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address operator)
```

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| tokenId | uint256 | undefined   |

#### Returns

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| operator | address | undefined   |

### getBalance

```solidity
function getBalance(address _tokenAddress, address _account) external view returns (uint256)
```

Gets the current balance of the account provided.

#### Parameters

| Name           | Type    | Description                                |
| -------------- | ------- | ------------------------------------------ |
| \_tokenAddress | address | The token type to retrieve the balance of. |
| \_account      | address | The account to get the balance of.         |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getCancelAndRefundApprovalHash

```solidity
function getCancelAndRefundApprovalHash(address _keyOwner, address _txSender) external view returns (bytes32 approvalHash)
```

_returns the hash to sign in order to allow another user to cancel on your behalf._

#### Parameters

| Name       | Type    | Description                                               |
| ---------- | ------- | --------------------------------------------------------- |
| \_keyOwner | address | The key owner&#39;s address                               |
| \_txSender | address | The address cancelling the key on behalf of the key-owner |

#### Returns

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| approvalHash | bytes32 | undefined   |

### getCancelAndRefundValueFor

```solidity
function getCancelAndRefundValueFor(address _owner) external view returns (uint256 refund)
```

_Determines how much of a refund a key owner would receive if they issued_

#### Parameters

| Name    | Type    | Description                                                                                                                                                                                                    |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_owner | address | The key owner to get the refund value for. a cancelAndRefund block.timestamp. Note that due to the time required to mine a tx, the actual refund amount will be lower than what the user reads from this call. |

#### Returns

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| refund | uint256 | undefined   |

### getHasValidKey

```solidity
function getHasValidKey(address _owner) external view returns (bool)
```

Checks if the user has a non-expired key.

#### Parameters

| Name    | Type    | Description                  |
| ------- | ------- | ---------------------------- |
| \_owner | address | The address of the key owner |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### getOwnersByPage

```solidity
function getOwnersByPage(uint256 _page, uint256 _pageSize) external view returns (address[])
```

A function which returns a subset of the keys for this Lock as an array

_Throws if there are no key owners yet_

#### Parameters

| Name       | Type    | Description                                                |
| ---------- | ------- | ---------------------------------------------------------- |
| \_page     | uint256 | the page of key owners requested when faceted by page size |
| \_pageSize | uint256 | the number of Key Owners requested per page                |

#### Returns

| Name | Type      | Description |
| ---- | --------- | ----------- |
| \_0  | address[] | undefined   |

### getTokenIdFor

```solidity
function getTokenIdFor(address _account) external view returns (uint256)
```

Find the tokenId for a given user

_Throws if key owner does not have a valid key_

#### Parameters

| Name      | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| \_account | address | The address of the key owner |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### getTransferFee

```solidity
function getTransferFee(address _owner, uint256 _time) external view returns (uint256)
```

Determines how much of a fee a key owner would need to pay in order to transfer the key to another account. This is pro-rated so the fee goes down overtime.

_Throws if \_owner does not have a valid key_

#### Parameters

| Name    | Type    | Description                                      |
| ------- | ------- | ------------------------------------------------ |
| \_owner | address | The owner of the key check the transfer fee for. |
| \_time  | uint256 | The amount of time to calculate the fee for.     |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### grantKeys

```solidity
function grantKeys(address[] _recipients, uint256[] _expirationTimestamps) external nonpayable
```

Allows the Lock owner to give a collection of users a key with no charge. Each key may be assigned a different expiration date.

_Throws if called by other than the lock-owner_

#### Parameters

| Name                   | Type      | Description                                                  |
| ---------------------- | --------- | ------------------------------------------------------------ |
| \_recipients           | address[] | An array of receiving addresses                              |
| \_expirationTimestamps | uint256[] | An array of expiration Timestamps for the keys being granted |

### initialize

```solidity
function initialize(address _owner, uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName) external nonpayable
```

=================================================================== Functions

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| \_owner              | address | undefined   |
| \_expirationDuration | uint256 | undefined   |
| \_tokenAddress       | address | undefined   |
| \_keyPrice           | uint256 | undefined   |
| \_maxNumberOfKeys    | uint256 | undefined   |
| \_lockName           | string  | undefined   |

### invalidateOffchainApproval

```solidity
function invalidateOffchainApproval(uint256 _nextAvailableNonce) external nonpayable
```

Sets the minimum nonce for a valid off-chain approval message from the senders account.

_This can be used to invalidate a previously signed message._

#### Parameters

| Name                 | Type    | Description |
| -------------------- | ------- | ----------- |
| \_nextAvailableNonce | uint256 | undefined   |

### isAlive

```solidity
function isAlive() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| owner    | address | undefined   |
| operator | address | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### isKeyOwner

```solidity
function isKeyOwner(uint256 _tokenId, address _owner) external view returns (bool)
```

Checks if the given address owns the given tokenId.

#### Parameters

| Name      | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| \_tokenId | uint256 | The tokenId of the key to check  |
| \_owner   | address | The potential key owners address |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### isOwner

```solidity
function isOwner() external view returns (bool)
```

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### keyCancelInterfaceId

```solidity
function keyCancelInterfaceId() external view returns (bytes32)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### keyExpirationTimestampFor

```solidity
function keyExpirationTimestampFor(address _owner) external view returns (uint256 timestamp)
```

_Returns the key&#39;s ExpirationTimestamp field for a given owner.Throws if owner has never owned a key for this lock_

#### Parameters

| Name    | Type    | Description                                    |
| ------- | ------- | ---------------------------------------------- |
| \_owner | address | address of the user for whom we search the key |

#### Returns

| Name      | Type    | Description |
| --------- | ------- | ----------- |
| timestamp | uint256 | undefined   |

### keyOwnerToNonce

```solidity
function keyOwnerToNonce(address) external view returns (uint256)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### keyPrice

```solidity
function keyPrice() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### keySoldInterfaceId

```solidity
function keySoldInterfaceId() external view returns (bytes32)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | bytes32 | undefined   |

### maxNumberOfKeys

```solidity
function maxNumberOfKeys() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

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

### owner

```solidity
function owner() external view returns (address)
```

=================================================================== From Openzeppelin&#39;s Ownable.sol

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address owner)
```

_Returns the owner of the NFT specified by `tokenId`._

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| tokenId | uint256 | undefined   |

#### Returns

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| owner | address | undefined   |

### owners

```solidity
function owners(uint256) external view returns (address)
```

#### Parameters

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### publicLockVersion

```solidity
function publicLockVersion() external pure returns (uint256)
```

The version number of the current implementation on this network.

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### purchase

```solidity
function purchase(uint256 _value, address _recipient, address _referrer, bytes _data) external payable
```

_Purchase functionThrows if lock is disabled. Throws if lock is sold-out. Throws if \_recipient == address(0).Setting \_value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the price while my transaction is pending I can&#39;t be charged more than I expected (only applicable to ERC-20 when more than keyPrice is approved for spending)._

#### Parameters

| Name        | Type    | Description                                                                                                                            |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| \_value     | uint256 | the number of tokens to pay for this purchase &gt;= the current keyPrice - any applicable discount (\_value is ignored when using ETH) |
| \_recipient | address | address of the recipient of the purchased key                                                                                          |
| \_referrer  | address | address of the user making the referral                                                                                                |
| \_data      | bytes   | arbitrary data populated by the front-end which initiated the sale                                                                     |

### refundPenaltyBasisPoints

```solidity
function refundPenaltyBasisPoints() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```

_Transfers a specific NFT (`tokenId`) from one account (`from`) to another (`to`). _ _ Requirements: - `from`, `to` cannot be zero. - `tokenId` must be owned by `from`. - If the caller is not `from`, it must be have been allowed to move this NFT by either `approve` or `setApprovalForAll`._

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

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool _approved) external nonpayable
```

#### Parameters

| Name       | Type    | Description |
| ---------- | ------- | ----------- |
| operator   | address | undefined   |
| \_approved | bool    | undefined   |

### setBaseTokenURI

```solidity
function setBaseTokenURI(string _baseTokenURI) external nonpayable
```

Allows the Lock owner to update the baseTokenURI for this Lock.

_Throws if called by other than the lock owner_

#### Parameters

| Name           | Type   | Description                                            |
| -------------- | ------ | ------------------------------------------------------ |
| \_baseTokenURI | string | String representing the base of the URI for this lock. |

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

=================================================================== From ERC165.sol

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

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

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
function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)
```

#### Parameters

| Name  | Type    | Description |
| ----- | ------- | ----------- |
| owner | address | undefined   |
| index | uint256 | undefined   |

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

| Name | Type   | Description |
| ---- | ------ | ----------- |
| \_0  | string | undefined   |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | uint256 | undefined   |

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

_Transfers a specific NFT (`tokenId`) from one account (`from`) to another (`to`). _ Requirements: - If the caller is not `from`, it must be approved to move this NFT by either `approve` or `setApprovalForAll`.\*

#### Parameters

| Name    | Type    | Description |
| ------- | ------- | ----------- |
| from    | address | undefined   |
| to      | address | undefined   |
| tokenId | uint256 | undefined   |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| newOwner | address | undefined   |

### unlockProtocol

```solidity
function unlockProtocol() external view returns (address)
```

#### Returns

| Name | Type    | Description |
| ---- | ------- | ----------- |
| \_0  | address | undefined   |

### updateBeneficiary

```solidity
function updateBeneficiary(address _beneficiary) external nonpayable
```

A function which lets the owner of the lock update the beneficiary account, which receives funds on withdrawal.

_Throws if called by other than owner of beneficiaryThrows if \_beneficiary is address(0)_

#### Parameters

| Name          | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| \_beneficiary | address | The new address to set as the beneficiary |

### updateKeyPrice

```solidity
function updateKeyPrice(uint256 _keyPrice) external nonpayable
```

A function which lets the owner of the lock to change the price for future purchases.

_Throws if called by other than ownerThrows if lock has been disabled_

#### Parameters

| Name       | Type    | Description                   |
| ---------- | ------- | ----------------------------- |
| \_keyPrice | uint256 | The new price to set for keys |

### updateLockName

```solidity
function updateLockName(string _lockName) external nonpayable
```

Allows the Lock owner to assign a descriptive name for this Lock.

_Throws if called by other than the lock owner_

#### Parameters

| Name       | Type   | Description               |
| ---------- | ------ | ------------------------- |
| \_lockName | string | The new name for the lock |

### updateLockSymbol

```solidity
function updateLockSymbol(string _lockSymbol) external nonpayable
```

Allows the Lock owner to assign a Symbol for this Lock.

_Throws if called by other than the lock owner_

#### Parameters

| Name         | Type   | Description                 |
| ------------ | ------ | --------------------------- |
| \_lockSymbol | string | The new Symbol for the lock |

### updateRefundPenalty

```solidity
function updateRefundPenalty(uint256 _freeTrialLength, uint256 _refundPenaltyBasisPoints) external nonpayable
```

Allow the owner to change the refund penalty.

_Throws if called by other than owner_

#### Parameters

| Name                       | Type    | Description                                   |
| -------------------------- | ------- | --------------------------------------------- |
| \_freeTrialLength          | uint256 | The new duration of free trials for this lock |
| \_refundPenaltyBasisPoints | uint256 | The new refund penaly in basis-points(bps)    |

### updateTransferFee

```solidity
function updateTransferFee(uint256 _transferFeeBasisPoints) external nonpayable
```

Allow the Lock owner to change the transfer fee.

_Throws if called by other than lock-owner_

#### Parameters

| Name                     | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| \_transferFeeBasisPoints | uint256 | The new transfer fee in basis-points(bps). Ex: 200 bps = 2% |

### withdraw

```solidity
function withdraw(address _tokenAddress, uint256 _amount) external nonpayable
```

_Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.Throws if called by other than the owner or beneficiary_

#### Parameters

| Name           | Type    | Description                                                                                                                                                                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_tokenAddress | address | specifies the token address to withdraw or 0 for ETH. This is usually the same as `tokenAddress` in MixinFunds.                                                                                                                                     |
| \_amount       | uint256 | specifies the max amount to withdraw, which may be reduced when considering the available balance. Set to 0 or MAX_UINT to withdraw everything. -- however be wary of draining funds as it breaks the `cancelAndRefund` and `fullRefund` use cases. |

## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| owner `indexed`    | address | undefined   |
| approved `indexed` | address | undefined   |
| tokenId `indexed`  | uint256 | undefined   |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| owner `indexed`    | address | undefined   |
| operator `indexed` | address | undefined   |
| approved           | bool    | undefined   |

### CancelKey

```solidity
event CancelKey(uint256 indexed tokenId, address indexed owner, address indexed sendTo, uint256 refund)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| tokenId `indexed` | uint256 | undefined   |
| owner `indexed`   | address | undefined   |
| sendTo `indexed`  | address | undefined   |
| refund            | uint256 | undefined   |

### Destroy

```solidity
event Destroy(uint256 balance, address indexed owner)
```

#### Parameters

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| balance         | uint256 | undefined   |
| owner `indexed` | address | undefined   |

### Disable

```solidity
event Disable()
```

### ExpireKey

```solidity
event ExpireKey(uint256 indexed tokenId)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| tokenId `indexed` | uint256 | undefined   |

### NewLockSymbol

```solidity
event NewLockSymbol(string symbol)
```

#### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| symbol | string | undefined   |

### NonceChanged

```solidity
event NonceChanged(address indexed keyOwner, uint256 nextAvailableNonce)
```

#### Parameters

| Name               | Type    | Description |
| ------------------ | ------- | ----------- |
| keyOwner `indexed` | address | undefined   |
| nextAvailableNonce | uint256 | undefined   |

### PriceChanged

```solidity
event PriceChanged(uint256 oldKeyPrice, uint256 keyPrice)
```

#### Parameters

| Name        | Type    | Description |
| ----------- | ------- | ----------- |
| oldKeyPrice | uint256 | undefined   |
| keyPrice    | uint256 | undefined   |

### RefundPenaltyChanged

```solidity
event RefundPenaltyChanged(uint256 freeTrialLength, uint256 refundPenaltyBasisPoints)
```

#### Parameters

| Name                     | Type    | Description |
| ------------------------ | ------- | ----------- |
| freeTrialLength          | uint256 | undefined   |
| refundPenaltyBasisPoints | uint256 | undefined   |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```

#### Parameters

| Name              | Type    | Description |
| ----------------- | ------- | ----------- |
| from `indexed`    | address | undefined   |
| to `indexed`      | address | undefined   |
| tokenId `indexed` | uint256 | undefined   |

### TransferFeeChanged

```solidity
event TransferFeeChanged(uint256 transferFeeBasisPoints)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| transferFeeBasisPoints | uint256 | undefined   |

### Withdrawal

```solidity
event Withdrawal(address indexed sender, address indexed tokenAddress, address indexed beneficiary, uint256 amount)
```

#### Parameters

| Name                   | Type    | Description |
| ---------------------- | ------- | ----------- |
| sender `indexed`       | address | undefined   |
| tokenAddress `indexed` | address | undefined   |
| beneficiary `indexed`  | address | undefined   |
| amount                 | uint256 | undefined   |
