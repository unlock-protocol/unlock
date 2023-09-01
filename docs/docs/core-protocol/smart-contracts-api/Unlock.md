# Unlock (v12)



> The Unlock Interface*





## Methods

### __initializeOwnable

```solidity
function __initializeOwnable(address sender) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender | address | undefined |

### addLockTemplate

```solidity
function addLockTemplate(address impl, uint16 version) external nonpayable
```

Add a PublicLock template to be used for future calls to `createLock`.

*This is used to upgrade conytract per version number*

#### Parameters

| Name | Type | Description |
|---|---|---|
| impl | address | undefined |
| version | uint16 | undefined |

### chainId

```solidity
function chainId() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### computeAvailableDiscountFor

```solidity
function computeAvailableDiscountFor(address _purchaser, uint256 _keyPrice) external pure returns (uint256 discount, uint256 tokens)
```

[DEPRECATED] Call to this function has been removed from PublicLock &gt; v9.

*[DEPRECATED] Kept for backwards compatibility This function returns the discount available for a user, when purchasing a a key from a lock. This does not modify the state. It returns both the discount and the number of tokens consumed to grant that discount.*

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
function configUnlock(address _udt, address _weth, uint256 _estimatedGasForPurchase, string _symbol, string _URI, uint256 _chainId) external nonpayable
```

Allows the owner to update configuration variables



#### Parameters

| Name | Type | Description |
|---|---|---|
| _udt | address | undefined |
| _weth | address | undefined |
| _estimatedGasForPurchase | uint256 | undefined |
| _symbol | string | undefined |
| _URI | string | undefined |
| _chainId | uint256 | undefined |

### createLock

```solidity
function createLock(uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName, bytes12) external nonpayable returns (address)
```

Create lock (legacy) This deploys a lock for a creator. It also keeps track of the deployed lock.

*internally call `createUpgradeableLock`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _expirationDuration | uint256 | the duration of the lock (pass 0 for unlimited duration) |
| _tokenAddress | address | set to the ERC20 token address, or 0 for ETH. |
| _keyPrice | uint256 | the price of each key |
| _maxNumberOfKeys | uint256 | the maximum nimbers of keys to be edited |
| _lockName | string | the name of the lock param _salt [deprec] -- kept only for backwards copatibility This may be implemented as a sequence ID or with RNG. It&#39;s used with `create2` to know the lock&#39;s address before the transaction is mined. |
| _5 | bytes12 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### createUpgradeableLock

```solidity
function createUpgradeableLock(bytes data) external nonpayable returns (address)
```

Create lock (default) This deploys a lock for a creator. It also keeps track of the deployed lock.

*this call is passed as encoded function - for instance:  bytes memory data = abi.encodeWithSignature(    &#39;initialize(address,uint256,address,uint256,uint256,string)&#39;,    msg.sender,    _expirationDuration,    _tokenAddress,    _keyPrice,    _maxNumberOfKeys,    _lockName  );*

#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes | bytes containing the call to initialize the lock template |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address of the create lock |

### createUpgradeableLockAtVersion

```solidity
function createUpgradeableLockAtVersion(bytes data, uint16 _lockVersion) external nonpayable returns (address)
```

Create an upgradeable lock using a specific PublicLock version



#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes | bytes containing the call to initialize the lock template (refer to createUpgradeableLock for more details) |
| _lockVersion | uint16 | the version of the lock to use |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### estimatedGasForPurchase

```solidity
function estimatedGasForPurchase() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getAdmin

```solidity
function getAdmin() external view returns (address)
```

Returns the ProxyAdmin contract address that manage upgrades for  the current Unlock contract.

*this reads the address directly from storage, at the slot `_ADMIN_SLOT`  defined by Open Zeppelin&#39;s EIP1967 Proxy implementation which corresponds to the keccak-256 hash of &quot;eip1967.proxy.admin&quot; subtracted by 1*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getGlobalBaseTokenURI

```solidity
function getGlobalBaseTokenURI() external view returns (string)
```



*Redundant with globalBaseTokenURI() for backwards compatibility with v3 &amp; v4 locks.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getGlobalTokenSymbol

```solidity
function getGlobalTokenSymbol() external view returns (string)
```



*Redundant with globalTokenSymbol() for backwards compatibility with v3 &amp; v4 locks.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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

### grossNetworkProduct

```solidity
function grossNetworkProduct() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### initialize

```solidity
function initialize(address _unlockOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _unlockOwner | address | undefined |

### initializeProxyAdmin

```solidity
function initializeProxyAdmin() external nonpayable
```



*deploy a ProxyAdmin contract used to upgrade locks*


### isOwner

```solidity
function isOwner() external view returns (bool)
```



*Returns true if the caller is the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### locks

```solidity
function locks(address) external view returns (bool deployed, uint256 totalSales, uint256 yieldedDiscountTokens)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| deployed | bool | undefined |
| totalSales | uint256 | undefined |
| yieldedDiscountTokens | uint256 | undefined |

### networkBaseFee

```solidity
function networkBaseFee() external view returns (uint256)
```

Helper to get the network mining basefee as introduced in EIP-1559

*this helper can be wrapped in try/catch statement to avoid revert in networks where EIP-1559 is not implemented*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### postLockUpgrade

```solidity
function postLockUpgrade() external nonpayable
```

Call executed by a lock after its version upgrade triggred by `upgradeLock` - PublicLock v12 &gt; v13 (mainnet): migrate an existing Lock to another instance  of the Unlock contract

*The `msg.sender` will be the upgraded lock*


### protocolFee

```solidity
function protocolFee() external view returns (uint256)
```

The fee (in basis points) collected by the protocol on each purchase /  extension / renewal of a key




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | the protocol fee in basic point |

### proxyAdminAddress

```solidity
function proxyAdminAddress() external view returns (address _proxyAdminAddress)
```

Retrieve the contract address of the proxy admin that manages the locks




#### Returns

| Name | Type | Description |
|---|---|---|
| _proxyAdminAddress | address | the address of the ProxyAdmin instance |

### publicLockAddress

```solidity
function publicLockAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### publicLockImpls

```solidity
function publicLockImpls(uint16 _version) external view returns (address _implAddress)
```

Match lock templates addresses with version numbers



#### Parameters

| Name | Type | Description |
|---|---|---|
| _version | uint16 | the number of the version of the template |

#### Returns

| Name | Type | Description |
|---|---|---|
| _implAddress | address | address of the lock templates |

### publicLockLatestVersion

```solidity
function publicLockLatestVersion() external view returns (uint16 _version)
```

Retrive the latest existing lock template version




#### Returns

| Name | Type | Description |
|---|---|---|
| _version | uint16 | the version number of the latest template (used to deploy contracts) |

### publicLockVersions

```solidity
function publicLockVersions(address _impl) external view returns (uint16)
```

Match version numbers with lock templates addresses



#### Parameters

| Name | Type | Description |
|---|---|---|
| _impl | address | the address of the deployed template contract (PublicLock) |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16 | number of the version corresponding to this address |

### recordConsumedDiscount

```solidity
function recordConsumedDiscount(uint256 _discount, uint256 _tokens) external view
```

[DEPRECATED] Call to this function has been removed from PublicLock &gt; v9.

*[DEPRECATED] Kept for backwards compatibility This function will keep track of consumed discounts by a given user. It will also grant discount tokens to the creator who is granting the discount based on the amount of discount and compensation rate. This function is invoked by a previously deployed lock only.*

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

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### resetTrackedValue

```solidity
function resetTrackedValue(uint256 _grossNetworkProduct, uint256 _totalDiscountGranted) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _grossNetworkProduct | uint256 | undefined |
| _totalDiscountGranted | uint256 | undefined |

### setLockTemplate

```solidity
function setLockTemplate(address payable _publicLockAddress) external nonpayable
```

Upgrade the PublicLock template used for future calls to `createLock`.

*This will initialize the template and revokeOwnership.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _publicLockAddress | address payable | undefined |

### setOracle

```solidity
function setOracle(address _tokenAddress, address _oracleAddress) external nonpayable
```

allows the owner to set the oracle address to use for value conversions setting the _oracleAddress to address(0) removes support for the token

*This will also call update to ensure at least one datapoint has been recorded.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenAddress | address | undefined |
| _oracleAddress | address | undefined |

### setProtocolFee

```solidity
function setProtocolFee(uint256 _protocolFee) external nonpayable
```

Set the fee collected by the protocol



#### Parameters

| Name | Type | Description |
|---|---|---|
| _protocolFee | uint256 | fee (in basis points) |

### totalDiscountGranted

```solidity
function totalDiscountGranted() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### udt

```solidity
function udt() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### uniswapOracles

```solidity
function uniswapOracles(address) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### unlockVersion

```solidity
function unlockVersion() external pure returns (uint16)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint16 | undefined |

### upgradeLock

```solidity
function upgradeLock(address payable lockAddress, uint16 version) external nonpayable returns (address)
```

Upgrade a lock to a specific version

*only available for publicLockVersion &gt; 10 (proxyAdmin /required)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| lockAddress | address payable | the existing lock address |
| version | uint16 | the version number you are targeting Likely implemented with OpenZeppelin TransparentProxy contract |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### weth

```solidity
function weth() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |




