# IUnlockV5



> The Unlock Interface*





## Methods

### computeAvailableDiscountFor

```solidity
function computeAvailableDiscountFor(address _purchaser, uint256 _keyPrice) external view returns (uint256 discount, uint256 tokens)
```

This function returns the discount available for a user, when purchasing a a key from a lock. This does not modify the state. It returns both the discount and the number of tokens consumed to grant that discount.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _purchaser | address | undefined |
| _keyPrice | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| discount | uint256 | undefined |
| tokens | uint256 | undefined |

### configUnlock

```solidity
function configUnlock(address _publicLockAddress, string _symbol, string _URI) external nonpayable
```

Function for the owner to update configuration variables. Should throw if called by other than owner.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _publicLockAddress | address | undefined |
| _symbol | string | undefined |
| _URI | string | undefined |

### createLock

```solidity
function createLock(uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName, bytes12 _salt) external nonpayable
```



*Create lock This deploys a lock for a creator. It also keeps track of the deployed lock.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _expirationDuration | uint256 | undefined |
| _tokenAddress | address | set to the ERC20 token address, or 0 for ETH. |
| _keyPrice | uint256 | undefined |
| _maxNumberOfKeys | uint256 | undefined |
| _lockName | string | undefined |
| _salt | bytes12 | an identifier for the Lock, which is unique for the user. This may be implemented as a sequence ID or with RNG. It&#39;s used with `create2` to know the lock&#39;s address before the transaction is mined. |

### globalBaseTokenURI

```solidity
function globalBaseTokenURI() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### globalTokenSymbol

```solidity
function globalTokenSymbol() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### initialize

```solidity
function initialize(address _owner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _owner | address | undefined |

### recordConsumedDiscount

```solidity
function recordConsumedDiscount(uint256 _discount, uint256 _tokens) external nonpayable
```

This function will keep track of consumed discounts by a given user. It will also grant discount tokens to the creator who is granting the discount based on the amount of discount and compensation rate. This function is invoked by a previously deployed lock only.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _discount | uint256 | undefined |
| _tokens | uint256 | undefined |

### recordKeyPurchase

```solidity
function recordKeyPurchase(uint256 _value, address _referrer) external nonpayable
```

This function keeps track of the added GDP, as well as grants of discount tokens to the referrer, if applicable. The number of discount tokens granted is based on the value of the referal, the current growth rate and the lock&#39;s discount token distribution rate This function is invoked by a previously deployed lock only.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _value | uint256 | undefined |
| _referrer | address | undefined |

### resetTrackedValue

```solidity
function resetTrackedValue(uint256 _grossNetworkProduct, uint256 _totalDiscountGranted) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _grossNetworkProduct | uint256 | undefined |
| _totalDiscountGranted | uint256 | undefined |



## Events

### ConfigUnlock

```solidity
event ConfigUnlock(address publicLockAddress, string globalTokenSymbol, string globalTokenURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| publicLockAddress  | address | undefined |
| globalTokenSymbol  | string | undefined |
| globalTokenURI  | string | undefined |

### NewLock

```solidity
event NewLock(address indexed lockOwner, address indexed newLockAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| lockOwner `indexed` | address | undefined |
| newLockAddress `indexed` | address | undefined |

### ResetTrackedValue

```solidity
event ResetTrackedValue(uint256 grossNetworkProduct, uint256 totalDiscountGranted)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| grossNetworkProduct  | uint256 | undefined |
| totalDiscountGranted  | uint256 | undefined |



