# Solidity API

## Unlock (v14)

### initialize

```solidity
function initialize(address _unlockOwner) external
```

### initializeProxyAdmin

```solidity
function initializeProxyAdmin() external
```

_deploy a ProxyAdmin contract used to upgrade locks_

### proxyAdminAddress

```solidity
function proxyAdminAddress() external view returns (address _proxyAdminAddress)
```

Retrieve the contract address of the proxy admin that manages the locks

#### Return Values

| Name                | Type    | Description                            |
| ------------------- | ------- | -------------------------------------- |
| \_proxyAdminAddress | address | the address of the ProxyAdmin instance |

### createLock

```solidity
function createLock(uint256 _expirationDuration, address _tokenAddress, uint256 _keyPrice, uint256 _maxNumberOfKeys, string _lockName, bytes12) external returns (address)
```

Create lock (legacy)
This deploys a lock for a creator. It also keeps track of the deployed lock.

_internally call `createUpgradeableLock`_

#### Parameters

| Name                 | Type    | Description                                                                                                                                                                                                                   |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_expirationDuration | uint256 | the duration of the lock (pass 0 for unlimited duration)                                                                                                                                                                      |
| \_tokenAddress       | address | set to the ERC20 token address, or 0 for ETH.                                                                                                                                                                                 |
| \_keyPrice           | uint256 | the price of each key                                                                                                                                                                                                         |
| \_maxNumberOfKeys    | uint256 | the maximum nimbers of keys to be edited                                                                                                                                                                                      |
| \_lockName           | string  | the name of the lock param \_salt [deprec] -- kept only for backwards copatibility This may be implemented as a sequence ID or with RNG. It's used with `create2` to know the lock's address before the transaction is mined. |
|                      | bytes12 |                                                                                                                                                                                                                               |

### createUpgradeableLock

```solidity
function createUpgradeableLock(bytes data) external returns (address)
```

Create lock (default)
This deploys a lock for a creator. It also keeps track of the deployed lock.

_this call is passed as encoded function - for instance:
bytes memory data = abi.encodeWithSignature(
'initialize(address,uint256,address,uint256,uint256,string)',
msg.sender,
\_expirationDuration,
\_tokenAddress,
\_keyPrice,
\_maxNumberOfKeys,
\_lockName
);_

#### Parameters

| Name | Type  | Description                                               |
| ---- | ----- | --------------------------------------------------------- |
| data | bytes | bytes containing the call to initialize the lock template |

#### Return Values

| Name | Type    | Description                |
| ---- | ------- | -------------------------- |
| [0]  | address | address of the create lock |

### createUpgradeableLockAtVersion

```solidity
function createUpgradeableLockAtVersion(bytes data, uint16 lockVersion) external returns (address)
```

Create an upgradeable lock using a specific PublicLock version

#### Parameters

| Name        | Type   | Description                                                                                                 |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| data        | bytes  | bytes containing the call to initialize the lock template (refer to createUpgradeableLock for more details) |
| lockVersion | uint16 | the version of the lock to use                                                                              |

### createUpgradeableLockAtVersion

```solidity
function createUpgradeableLockAtVersion(bytes data, uint16 lockVersion, bytes[] transactions) external returns (address)
```

Create an upgradeable lock using a specific PublicLock version, and execute
transaction(s) on the created lock.

#### Parameters

| Name         | Type    | Description                                                                                                                                                                          |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| data         | bytes   | bytes containing the call to initialize the lock template (refer to createUpgradeableLock for more details). Importantly, the initial lock manager needs to be set to this contract. |
| lockVersion  | uint16  | the version of the lock to use                                                                                                                                                       |
| transactions | bytes[] | an array of transactions to be executed on the newly created lock. It is recommended to include a transaction to renounce the lock manager as the last transaction.                  |

### upgradeLock

```solidity
function upgradeLock(address payable lockAddress, uint16 version) external returns (address)
```

Upgrade a lock to a specific version

_only available for publicLockVersion > 10 (proxyAdmin /required)_

#### Parameters

| Name        | Type            | Description                                                                                         |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------- |
| lockAddress | address payable | the existing lock address                                                                           |
| version     | uint16          | the version number you are targeting Likely implemented with OpenZeppelin TransparentProxy contract |

### recordKeyPurchase

```solidity
function recordKeyPurchase(uint256 _value, address _referrer) external
```

This function keeps track of the added GDP, as well as grants of discount tokens
to the referrer, if applicable.
The number of discount tokens granted is based on the value of the referal,
the current growth rate and the lock's discount token distribution rate
This function is invoked by a previously deployed lock only.

### recordConsumedDiscount

```solidity
function recordConsumedDiscount(uint256 _discount, uint256 _tokens) external view
```

[DEPRECATED] Call to this function has been removed from PublicLock > v9.

_[DEPRECATED] Kept for backwards compatibility
This function will keep track of consumed discounts by a given user.
It will also grant discount tokens to the creator who is granting the discount based on the
amount of discount and compensation rate.
This function is invoked by a previously deployed lock only._

### computeAvailableDiscountFor

```solidity
function computeAvailableDiscountFor(address _purchaser, uint256 _keyPrice) external pure returns (uint256 discount, uint256 tokens)
```

[DEPRECATED] Call to this function has been removed from PublicLock > v9.

_[DEPRECATED] Kept for backwards compatibility
This function returns the discount available for a user, when purchasing a
a key from a lock.
This does not modify the state. It returns both the discount and the number of tokens
consumed to grant that discount._

### globalBaseTokenURI

```solidity
function globalBaseTokenURI() external view returns (string)
```

### getGlobalBaseTokenURI

```solidity
function getGlobalBaseTokenURI() external view returns (string)
```

_Redundant with globalBaseTokenURI() for backwards compatibility with v3 & v4 locks._

### globalTokenSymbol

```solidity
function globalTokenSymbol() external view returns (string)
```

### chainId

```solidity
function chainId() external view returns (uint256)
```

### getGlobalTokenSymbol

```solidity
function getGlobalTokenSymbol() external view returns (string)
```

_Redundant with globalTokenSymbol() for backwards compatibility with v3 & v4 locks._

### configUnlock

```solidity
function configUnlock(address _udt, address _weth, uint256 _estimatedGasForPurchase, string _symbol, string _URI, uint256 _chainId) external
```

Allows the owner to update configuration variables

### addLockTemplate

```solidity
function addLockTemplate(address impl, uint16 version) external
```

Add a PublicLock template to be used for future calls to `createLock`.

_This is used to upgrade conytract per version number_

### publicLockImpls

```solidity
function publicLockImpls(uint16 _version) external view returns (address _implAddress)
```

Match lock templates addresses with version numbers

#### Parameters

| Name      | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| \_version | uint16 | the number of the version of the template |

#### Return Values

| Name          | Type    | Description                   |
| ------------- | ------- | ----------------------------- |
| \_implAddress | address | address of the lock templates |

### publicLockVersions

```solidity
function publicLockVersions(address _impl) external view returns (uint16)
```

Match version numbers with lock templates addresses

#### Parameters

| Name   | Type    | Description                                                |
| ------ | ------- | ---------------------------------------------------------- |
| \_impl | address | the address of the deployed template contract (PublicLock) |

#### Return Values

| Name | Type   | Description                                         |
| ---- | ------ | --------------------------------------------------- |
| [0]  | uint16 | number of the version corresponding to this address |

### publicLockLatestVersion

```solidity
function publicLockLatestVersion() external view returns (uint16 _version)
```

Retrive the latest existing lock template version

#### Return Values

| Name      | Type   | Description                                                          |
| --------- | ------ | -------------------------------------------------------------------- |
| \_version | uint16 | the version number of the latest template (used to deploy contracts) |

### setLockTemplate

```solidity
function setLockTemplate(address payable _publicLockAddress) external
```

Upgrade the PublicLock template used for future calls to `createLock`.

_This will initialize the template and revokeOwnership._

### resetTrackedValue

```solidity
function resetTrackedValue(uint256 _grossNetworkProduct, uint256 _totalDiscountGranted) external
```

### grossNetworkProduct

```solidity
function grossNetworkProduct() external view returns (uint256)
```

### totalDiscountGranted

```solidity
function totalDiscountGranted() external view returns (uint256)
```

### locks

```solidity
function locks(address) external view returns (bool deployed, uint256 totalSales, uint256 yieldedDiscountTokens)
```

### publicLockAddress

```solidity
function publicLockAddress() external view returns (address)
```

### uniswapOracles

```solidity
function uniswapOracles(address) external view returns (address)
```

### weth

```solidity
function weth() external view returns (address)
```

### udt

```solidity
function udt() external view returns (address)
```

### governanceToken

```solidity
function governanceToken() external view returns (address)
```

### estimatedGasForPurchase

```solidity
function estimatedGasForPurchase() external view returns (uint256)
```

### networkBaseFee

```solidity
function networkBaseFee() external view returns (uint256)
```

Helper to get the network mining basefee as introduced in EIP-1559

_this helper can be wrapped in try/catch statement to avoid
revert in networks where EIP-1559 is not implemented_

### unlockVersion

```solidity
function unlockVersion() external pure returns (uint16)
```

### setOracle

```solidity
function setOracle(address _tokenAddress, address _oracleAddress) external
```

allows the owner to set the oracle address to use for value conversions
setting the \_oracleAddress to address(0) removes support for the token

_This will also call update to ensure at least one datapoint has been recorded._

### \_\_initializeOwnable

```solidity
function __initializeOwnable(address sender) external
```

### isOwner

```solidity
function isOwner() external view returns (bool)
```

_Returns true if the caller is the current owner._

### owner

```solidity
function owner() external view returns (address)
```

_Returns the address of the current owner._

### renounceOwnership

```solidity
function renounceOwnership() external
```

\_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner.\_

### transferOwnership

```solidity
function transferOwnership(address newOwner) external
```

_Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner._

### setProtocolFee

```solidity
function setProtocolFee(uint256 _protocolFee) external
```

Set the fee collected by the protocol

#### Parameters

| Name          | Type    | Description           |
| ------------- | ------- | --------------------- |
| \_protocolFee | uint256 | fee (in basis points) |

### protocolFee

```solidity
function protocolFee() external view returns (uint256)
```

The fee (in basis points) collected by the protocol on each purchase /
extension / renewal of a key

#### Return Values

| Name | Type    | Description                     |
| ---- | ------- | ------------------------------- |
| [0]  | uint256 | the protocol fee in basic point |

### getAdmin

```solidity
function getAdmin() external view returns (address)
```

Returns the ProxyAdmin contract address that manage upgrades for
the current Unlock contract.

_this reads the address directly from storage, at the slot `_ADMIN_SLOT`
defined by Open Zeppelin's EIP1967 Proxy implementation which corresponds
to the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1_

### postLockUpgrade

```solidity
function postLockUpgrade() external
```

Call executed by a lock after its version upgrade triggred by `upgradeLock`

- PublicLock v12 > v13 (mainnet): migrate an existing Lock to another instance
  of the Unlock contract

_The `msg.sender` will be the upgraded lock_

### transferTokens

```solidity
function transferTokens(address token, address to, uint256 amount) external
```

Functions which transfers tokens held by the contract
It handles both ERC20 and the base currency.

_This function is onlyOwner_

#### Parameters

| Name   | Type    | Description                                                                       |
| ------ | ------- | --------------------------------------------------------------------------------- |
| token  | address | the address of the token to transfer (pass the 0x0 address for the base currency) |
| to     | address | the address to transfer the tokens to                                             |
| amount | uint256 | the amount of tokens to transfer                                                  |

### removeLock

```solidity
function removeLock(address lock) external
```

Removes a lock from the list of locks. This will prevent the lock from being able to receive governance tokens.
The lock will still be able to sell its memberships.

_This function is onlyOwner_

#### Parameters

| Name | Type    | Description                   |
| ---- | ------- | ----------------------------- |
| lock | address | address of the lock to remove |

### swapAndBurn

```solidity
function swapAndBurn(address token, uint256 amount, uint24 poolFee) external
```

Send tokens held by this contract to the UDT SwapBurner contract. The tokens sent to the
contract are then swapped for UDT and UDT itself will be sent to a burner address.
This function can be called by anyone (not only the contract owner) as a way to ensure decentralization.

#### Parameters

| Name    | Type    | Description                                                              |
| ------- | ------- | ------------------------------------------------------------------------ |
| token   | address | the address of the token (zero address for native) to swap and burn      |
| amount  | uint256 | the amount of tokens to swap and burn                                    |
| poolFee | uint24  | the poolFee of the token - WETH/Wrapped Native asset to use for the swap |

### setSwapBurner

```solidity
function setSwapBurner(address _swapBurnerAddress) external
```

Set the UDT Swap and Burn contract address

#### Parameters

| Name                | Type    | Description                                     |
| ------------------- | ------- | ----------------------------------------------- |
| \_swapBurnerAddress | address | the address of the SwapBurner contract instance |

### swapBurnerAddress

```solidity
function swapBurnerAddress() external view returns (address)
```

The address of the UDT Swap and Burn contract

### burnLock

```solidity
function burnLock(address lockAddress) external
```

Disable an existing lock
after this step, the lock will be unsable

#### Parameters

| Name        | Type    | Description            |
| ----------- | ------- | ---------------------- |
| lockAddress | address | the addres of the lock |

### burnedLockImpl

```solidity
function burnedLockImpl() external view returns (address)
```

The implementation used to disable an existing lock

### setBurnedLockImpl

```solidity
function setBurnedLockImpl(address implAddress) external
```

Set the implementation that will be used when disabling a lock

_`burnLock` will perform a proxy upgrade of the lock to this contract_

#### Parameters

| Name        | Type    | Description                      |
| ----------- | ------- | -------------------------------- |
| implAddress | address | an empty implementation contract |
