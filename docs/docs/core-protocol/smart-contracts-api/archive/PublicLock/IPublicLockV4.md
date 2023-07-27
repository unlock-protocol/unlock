# IPublicLockV4



> The PublicLock Interface





## Methods

### address2Str

```solidity
function address2Str(address _addr) external pure returns (string)
```

A utility function for erc721 metadata



#### Parameters

| Name | Type | Description |
|---|---|---|
| _addr | address | An address to convert |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### approve

```solidity
function approve(address _approved, uint256 _tokenId) external payable
```

Set or reaffirm the approved address for an NFT

*The zero address indicates there is no approved address.Throws unless `msg.sender` is the current NFT owner, or an authorized  operator of the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _approved | address | The new approved NFT controller |
| _tokenId | uint256 | The NFT to approve |

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256)
```

In the specific case of a Lock, each owner can own only at most 1 key.

*Throws if _owner = address(0)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | The address of the key owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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
function cancelAndRefund() external nonpayable
```

Destroys the msg.sender&#39;s key and sends a refund based on the amount of time remaining.




### cancelAndRefundFor

```solidity
function cancelAndRefundFor(address _keyOwner, bytes _signature) external nonpayable
```



*Cancels a key owned by a different user and sends the funds to the msg.sender.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | this user&#39;s key will be canceled |
| _signature | bytes | getCancelAndRefundApprovalHash signed by the _keyOwner |

### destroyLock

```solidity
function destroyLock() external nonpayable
```

Used to clean up old lock contracts from the blockchain. TODO: add a check to ensure all keys are INVALID!

*Throws if called by other than owner.Throws if lock has not yet been disabled.*


### disableLock

```solidity
function disableLock() external nonpayable
```

Used to disable lock before migrating keys and/or destroying contract.

*Throws if called by other than the owner.Throws if lock contract has already been disabled.*


### expirationDuration

```solidity
function expirationDuration() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### expireKeyFor

```solidity
function expireKeyFor(address _owner) external nonpayable
```

A function which lets the owner of the lock expire a users&#39; key.

*Throws if called by other than lock ownerThrows if key owner does not have a valid key*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | The address of the key owner |

### getApproved

```solidity
function getApproved(uint256 _tokenId) external view returns (address)
```

Will return the approved recipient for a key, if any.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The ID of the token we&#39;re inquiring about. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getCancelAndRefundApprovalHash

```solidity
function getCancelAndRefundApprovalHash(address _keyOwner, address _txSender) external view returns (bytes32 approvalHash)
```



*returns the hash to sign in order to allow another user to cancel on your behalf.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyOwner | address | The key owner&#39;s address |
| _txSender | address | The address cancelling the key on behalf of the key-owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| approvalHash | bytes32 | undefined |

### getCancelAndRefundValueFor

```solidity
function getCancelAndRefundValueFor(address _owner) external view returns (uint256 refund)
```



*Determines how much of a refund a key owner would receive if they issued*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | The key owner to get the refund value for. a cancelAndRefund block.timestamp. Note that due to the time required to mine a tx, the actual refund amount will be lower than what the user reads from this call. |

#### Returns

| Name | Type | Description |
|---|---|---|
| refund | uint256 | undefined |

### getHasValidKey

```solidity
function getHasValidKey(address _owner) external view returns (bool)
```

Checks if the user has a non-expired key.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | The address of the key owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### getOwnersByPage

```solidity
function getOwnersByPage(uint256 _page, uint256 _pageSize) external view returns (address[])
```

A function which returns a subset of the keys for this Lock as an array

*Throws if there are no key owners yet*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _page | uint256 | the page of key owners requested when faceted by page size |
| _pageSize | uint256 | the number of Key Owners requested per page |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |

### getTokenIdFor

```solidity
function getTokenIdFor(address _account) external view returns (uint256)
```

Find the tokenId for a given user

*Throws if key owner does not have a valid key*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _account | address | The address of the key owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getTransferFee

```solidity
function getTransferFee(address _owner) external view returns (uint256)
```

Determines how much of a fee a key owner would need to pay in order to transfer the key to another account.  This is pro-rated so the fee goes down overtime.

*Throws if _owner does not have a valid key*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | The owner of the key check the transfer fee for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### grantKeys

```solidity
function grantKeys(address[] _recipients, uint256[] _expirationTimestamps) external nonpayable
```

Allows the Lock owner to give a collection of users a key with no charge. Each key may be assigned a different expiration date.

*Throws if called by other than the lock-owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipients | address[] | An array of receiving addresses |
| _expirationTimestamps | uint256[] | An array of expiration Timestamps for the keys being granted |

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
function isApprovedForAll(address _owner, address _operator) external view returns (bool)
```



*Tells whether an operator is approved by a given owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | owner address which you want to query the approval of |
| _operator | address | operator address which you want to query the approval of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isKeyOwner

```solidity
function isKeyOwner(uint256 _tokenId, address _owner) external view returns (bool)
```

Checks if the given address owns the given tokenId.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The tokenId of the key to check |
| _owner | address | The potential key owners address |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isOwner

```solidity
function isOwner() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### keyExpirationTimestampFor

```solidity
function keyExpirationTimestampFor(address _owner) external view returns (uint256 timestamp)
```



*Returns the key&#39;s ExpirationTimestamp field for a given owner.Throws if owner has never owned a key for this lock*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | address of the user for whom we search the key |

#### Returns

| Name | Type | Description |
|---|---|---|
| timestamp | uint256 | undefined |

### keyOwnerToNonce

```solidity
function keyOwnerToNonce(address) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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

### owner

```solidity
function owner() external view returns (address)
```

=================================================================== From Openzeppelin&#39;s Ownable.sol




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 _tokenId) external view returns (address)
```

Find the owner of an NFT

*NFTs assigned to zero address are considered invalid, and queries  about them do throw.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The identifier for an NFT |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### owners

```solidity
function owners(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### publicLockVersion

```solidity
function publicLockVersion() external pure returns (uint16)
```

The version number of the current implementation on this network.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16 | undefined |

### purchaseFor

```solidity
function purchaseFor(address _recipient) external payable
```



*Key Purchase functionThrows if lock is disabled.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipient | address | address of the recipient of the purchased key |

### purchaseForFrom

```solidity
function purchaseForFrom(address _recipient, address _referrer) external payable
```



*Purchase function, public version, with referrer.Throws if lock is disabled, or if referrer doesn&#39;t have a valid key.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _recipient | address | address of the recipient of the purchased key |
| _referrer | address | address of the user making the referral |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```






### safeTransferFrom

```solidity
function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable
```

Transfers the ownership of an NFT from one address to another address

*This works identically to the other function with an extra data parameter,  except this function just sets data to &#39;&#39;*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | The current owner of the NFT |
| _to | address | The new owner |
| _tokenId | uint256 | The NFT to transfer |

### safeTransferFrom

```solidity
function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable
```

Transfers the ownership of an NFT from one address to another address

*Throws unless `msg.sender` is the current owner, an authorized  operator, or the approved address for this NFT. Throws if `_from` is  not the current owner. Throws if `_to` is the zero address. Throws if  `_tokenId` is not a valid NFT. When transfer is complete, this function  checks if `_to` is a smart contract (code size &gt; 0). If so, it calls  `onERC721Received` on `_to` and throws if the return value is not  `bytes4(keccak256(&#39;onERC721Received(address,address,uint,bytes)&#39;))`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | The current owner of the NFT |
| _to | address | The new owner |
| _tokenId | uint256 | The NFT to transfer |
| data | bytes | Additional data with no specified format, sent in call to `_to` |

### setApprovalForAll

```solidity
function setApprovalForAll(address _to, bool _approved) external nonpayable
```



*Sets or unsets the approval of a given operator An operator is allowed to transfer all tokens of the sender on their behalfThrows if lock is disabled, or if _to == msg.sender.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address | operator address to set the approval |
| _approved | bool | representing the status of the approval to be set |

### setBaseTokenURI

```solidity
function setBaseTokenURI(string _baseTokenURI) external nonpayable
```

Allows the Lock owner to update the baseTokenURI for this Lock.

*Throws if called by other than the lock owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _baseTokenURI | string | String representing the base of the URI for this lock. |

### strConcat

```solidity
function strConcat(string _a, string _b, string _c, string _d) external pure returns (string _concatenatedString)
```

notice A utility function for erc721 metadata



#### Parameters

| Name | Type | Description |
|---|---|---|
| _a | string | String 1 |
| _b | string | String 2 |
| _c | string | String 3 |
| _d | string | String 4 |

#### Returns

| Name | Type | Description |
|---|---|---|
| _concatenatedString | string | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```

=================================================================== From ERC165.sol



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
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 _tokenId) external view returns (string)
```

A distinct Uniform Resource Identifier (URI) for a given asset.

*Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC 3986. The URI may point to a JSON file that conforms to the &quot;ERC721 Metadata JSON Schema&quot;. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | The tokenID we&#39;re inquiring about |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

=================================================================== From IERC721Enumerable




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _tokenId) external payable
```

=================================================================== From Openzeppelin&#39;s IERC721.solTransfer ownership of an NFT -- THE CALLER IS RESPONSIBLE  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE  THEY MAY BE PERMANENTLY LOST

*Throws unless `msg.sender` is the current owner, an authorized  operator, or the approved address for this NFT. Throws if `_from` is  not the current owner. Throws if `_to` is the zero address. Throws if  `_tokenId` is not a valid NFT.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _from | address | The current owner of the NFT |
| _to | address | The new owner |
| _tokenId | uint256 | The NFT to transfer |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### uint2Str

```solidity
function uint2Str(uint256 _i) external pure returns (string _uintAsString)
```

A utility function for erc721 metadata



#### Parameters

| Name | Type | Description |
|---|---|---|
| _i | uint256 | A uint to convert |

#### Returns

| Name | Type | Description |
|---|---|---|
| _uintAsString | string | undefined |

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

A function which lets the owner of the lock update the beneficiary account, which receives funds on withdrawal.

*Throws if called by other than owner of beneficiaryThrows if _beneficiary is address(0)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _beneficiary | address | The new address to set as the beneficiary |

### updateKeyPrice

```solidity
function updateKeyPrice(uint256 _keyPrice) external nonpayable
```

A function which lets the owner of the lock to change the price for future purchases.

*Throws if called by other than ownerThrows if lock has been disabled*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _keyPrice | uint256 | The new price to set for keys |

### updateLockName

```solidity
function updateLockName(string _lockName) external nonpayable
```

Allows the Lock owner to assign a descriptive name for this Lock.

*Throws if called by other than the lock owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _lockName | string | The new name for the lock |

### updateLockSymbol

```solidity
function updateLockSymbol(string _lockSymbol) external nonpayable
```

Allows the Lock owner to assign a Symbol for this Lock.

*Throws if called by other than the lock owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _lockSymbol | string | The new Symbol for the lock |

### updateRefundPenalty

```solidity
function updateRefundPenalty(uint256 _refundPenaltyNumerator, uint256 _refundPenaltyDenominator) external nonpayable
```

Allow the owner to change the refund penalty.

*Throws if called by other than owner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _refundPenaltyNumerator | uint256 | undefined |
| _refundPenaltyDenominator | uint256 | undefined |

### updateTransferFee

```solidity
function updateTransferFee(uint256 _transferFeeNumerator, uint256 _transferFeeDenominator) external nonpayable
```

Allow the Lock owner to change the transfer fee.

*Throws if called by other than lock-owner Ex: 200 bps = 2%*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _transferFeeNumerator | uint256 | undefined |
| _transferFeeDenominator | uint256 | undefined |

### withdraw

```solidity
function withdraw(uint256 _amount) external nonpayable
```



*Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.Throws if called by other than the owner or beneficiary*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | specifies the max amount to withdraw, which may be reduced when considering the available balance. Set to 0 or MAX_UINT to withdraw everything. -- however be wary of draining funds as it breaks the `cancelAndRefund` use case. |



## Events

### Approval

```solidity
event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _approved `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner `indexed` | address | undefined |
| _operator `indexed` | address | undefined |
| _approved  | bool | undefined |

### CancelKey

```solidity
event CancelKey(uint256 indexed tokenId, address indexed owner, address indexed sendTo, uint256 refund)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |
| sendTo `indexed` | address | undefined |
| refund  | uint256 | undefined |

### Destroy

```solidity
event Destroy(uint256 balance, address indexed owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| balance  | uint256 | undefined |
| owner `indexed` | address | undefined |

### Disable

```solidity
event Disable()
```






### ExpireKey

```solidity
event ExpireKey(uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### NewLockSymbol

```solidity
event NewLockSymbol(string symbol)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| symbol  | string | undefined |

### PriceChanged

```solidity
event PriceChanged(uint256 oldKeyPrice, uint256 keyPrice)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| oldKeyPrice  | uint256 | undefined |
| keyPrice  | uint256 | undefined |

### RefundPenaltyChanged

```solidity
event RefundPenaltyChanged(uint256 _refundPenaltyNumerator, uint256 _refundPenaltyDenominator)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _refundPenaltyNumerator  | uint256 | undefined |
| _refundPenaltyDenominator  | uint256 | undefined |

### Transfer

```solidity
event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _from `indexed` | address | undefined |
| _to `indexed` | address | undefined |
| _tokenId `indexed` | uint256 | undefined |

### TransferFeeChanged

```solidity
event TransferFeeChanged(uint256 _transferFeeNumerator, uint256 _transferFeeDenominator)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _transferFeeNumerator  | uint256 | undefined |
| _transferFeeDenominator  | uint256 | undefined |

### Withdrawal

```solidity
event Withdrawal(address indexed sender, address indexed beneficiary, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| beneficiary `indexed` | address | undefined |
| amount  | uint256 | undefined |



