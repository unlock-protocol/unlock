// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

/**
 * @title The Unlock Interface
 **/

interface IUnlock {
  // Use initialize instead of a constructor to support proxies(for upgradeability via zos).
  function initialize(address _unlockOwner) external;

  /**
   * @dev deploy a ProxyAdmin contract used to upgrade locks
   */
  function initializeProxyAdmin() external;

  /**
   * Retrieve the contract address of the proxy admin that manages the locks
   * @return the address of the ProxyAdmin instance
   */
  function proxyAdminAddress()
    external
    view
    returns (address);

  /**
   * @notice Create lock (legacy)
   * This deploys a lock for a creator. It also keeps track of the deployed lock.
   * @param _expirationDuration the duration of the lock (pass 0 for unlimited duration)
   * @param _tokenAddress set to the ERC20 token address, or 0 for ETH.
   * @param _keyPrice the price of each key
   * @param _maxNumberOfKeys the maximum nimbers of keys to be edited
   * @param _lockName the name of the lock
   * param _salt [deprec] -- kept only for backwards copatibility
   * This may be implemented as a sequence ID or with RNG. It's used with `create2`
   * to know the lock's address before the transaction is mined.
   * @dev internally call `createUpgradeableLock`
   */
  function createLock(
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata _lockName,
    bytes12 // _salt
  ) external returns (address);

  /**
   * @notice Create lock (default)
   * This deploys a lock for a creator. It also keeps track of the deployed lock.
   * @param data bytes containing the call to initialize the lock template
   * @dev this call is passed as encoded function - for instance:
   *  bytes memory data = abi.encodeWithSignature(
   *    'initialize(address,uint256,address,uint256,uint256,string)',
   *    msg.sender,
   *    _expirationDuration,
   *    _tokenAddress,
   *    _keyPrice,
   *    _maxNumberOfKeys,
   *    _lockName
   *  );
   * @return address of the create lock
   */
  function createUpgradeableLock(
    bytes memory data
  ) external returns (address);

  /**
   * Create an upgradeable lock using a specific PublicLock version
   * @param data bytes containing the call to initialize the lock template
   * (refer to createUpgradeableLock for more details)
   * @param _lockVersion the version of the lock to use
   */
  function createUpgradeableLockAtVersion(
    bytes memory data,
    uint16 _lockVersion
  ) external returns (address);

  /**
   * @notice Upgrade a lock to a specific version
   * @dev only available for publicLockVersion > 10 (proxyAdmin /required)
   * @param lockAddress the existing lock address
   * @param version the version number you are targeting
   * Likely implemented with OpenZeppelin TransparentProxy contract
   */
  function upgradeLock(
    address payable lockAddress,
    uint16 version
  ) external returns (address);

  /**
   * This function keeps track of the added GDP, as well as grants of discount tokens
   * to the referrer, if applicable.
   * The number of discount tokens granted is based on the value of the referal,
   * the current growth rate and the lock's discount token distribution rate
   * This function is invoked by a previously deployed lock only.
   */
  function recordKeyPurchase(
    uint _value,
    address _referrer // solhint-disable-line no-unused-vars
  ) external;

  /**
   * @notice [DEPRECATED] Call to this function has been removed from PublicLock > v9.
   * @dev [DEPRECATED] Kept for backwards compatibility
   * This function will keep track of consumed discounts by a given user.
   * It will also grant discount tokens to the creator who is granting the discount based on the
   * amount of discount and compensation rate.
   * This function is invoked by a previously deployed lock only.
   */
  function recordConsumedDiscount(
    uint _discount,
    uint _tokens // solhint-disable-line no-unused-vars
  ) external view;

  /**
   * @notice [DEPRECATED] Call to this function has been removed from PublicLock > v9.
   * @dev [DEPRECATED] Kept for backwards compatibility
   * This function returns the discount available for a user, when purchasing a
   * a key from a lock.
   * This does not modify the state. It returns both the discount and the number of tokens
   * consumed to grant that discount.
   */
  function computeAvailableDiscountFor(
    address _purchaser, // solhint-disable-line no-unused-vars
    uint _keyPrice // solhint-disable-line no-unused-vars
  ) external pure returns (uint discount, uint tokens);

  // Function to read the globalTokenURI field.
  function globalBaseTokenURI()
    external
    view
    returns (string memory);

  /**
   * @dev Redundant with globalBaseTokenURI() for backwards compatibility with v3 & v4 locks.
   */
  function getGlobalBaseTokenURI()
    external
    view
    returns (string memory);

  // Function to read the globalTokenSymbol field.
  function globalTokenSymbol()
    external
    view
    returns (string memory);

  // Function to read the chainId field.
  function chainId() external view returns (uint);

  /**
   * @dev Redundant with globalTokenSymbol() for backwards compatibility with v3 & v4 locks.
   */
  function getGlobalTokenSymbol()
    external
    view
    returns (string memory);

  /**
   * @notice Allows the owner to update configuration variables
   */
  function configUnlock(
    address _udt,
    address _weth,
    uint _estimatedGasForPurchase,
    string calldata _symbol,
    string calldata _URI,
    uint _chainId
  ) external;

  /**
   * @notice Add a PublicLock template to be used for future calls to `createLock`.
   * @dev This is used to upgrade conytract per version number
   */
  function addLockTemplate(
    address impl,
    uint16 version
  ) external;

  /**
   * Match lock templates addresses with version numbers
   * @param _version the number of the version of the template
   * @return address of the lock templates
   */
  function publicLockImpls(
    uint16 _version
  ) external view returns (address);

  /**
   * Match version numbers with lock templates addresses
   * @param _impl the address of the deployed template contract (PublicLock)
   * @return number of the version corresponding to this address
   */
  function publicLockVersions(
    address _impl
  ) external view returns (uint16);

  /**
   * Retrive the latest existing lock template version
   * @return the version number of the latest template (used to deploy contracts)
   */
  function publicLockLatestVersion()
    external
    view
    returns (uint16);

  /**
   * @notice Upgrade the PublicLock template used for future calls to `createLock`.
   * @dev This will initialize the template and revokeOwnership.
   */
  function setLockTemplate(
    address payable _publicLockAddress
  ) external;

  // Allows the owner to change the value tracking variables as needed.
  function resetTrackedValue(
    uint _grossNetworkProduct,
    uint _totalDiscountGranted
  ) external;

  function grossNetworkProduct()
    external
    view
    returns (uint);

  function totalDiscountGranted()
    external
    view
    returns (uint);

  function locks(
    address
  )
    external
    view
    returns (
      bool deployed,
      uint totalSales,
      uint yieldedDiscountTokens
    );

  // The address of the public lock template, used when `createLock` is called
  function publicLockAddress()
    external
    view
    returns (address);

  // Map token address to exchange contract address if the token is supported
  // Used for GDP calculations
  function uniswapOracles(
    address
  ) external view returns (address);

  // The WETH token address, used for value calculations
  function weth() external view returns (address);

  // The UDT token address, used to mint tokens on referral
  function udt() external view returns (address);


  /**
   * @return the address of Uniswap permit2  
   */
  function permit2() external returns (address);

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param permit2Address the address of Uniswap PERMIT2 contract  
   */
  function setPermit2(address permit2Address) external;

  /**
   * Swap tokens and call a function a lock contract.
   * 
   * Calling this function will 1) swap the token sent by the user into the token (ERCC20 or native) used by
   * the lock contract using Uniswap Universal Router and 2) call the lock contract with the specified calldata
   * 
   * @param lock the address of the lock
   * @param srcToken the address of the token sent by the user (ERC20 or address(0) for native)
   * @param amountInMax the maximum amount the user want to spend in the swap
   * @param swapRouter the address of the uniswap router
   * @param swapCalldata the Uniswap quote calldata returned by the SDK, to be sent to the router contract
   * @param callData the encoded instructions to be executed by the lock
   *
   * @return the bytes as returned by the execution on the lock
   * 
   * @notice If the actual amount spent is less than the specified maximum amount, the remaining tokens will 
   * be held by the Unlock contract
   */
  function swapAndCall( 
    address lock,
    address srcToken,
    uint amountInMax,
    address swapRouter,
    bytes memory swapCalldata,
    bytes memory callData
  ) external payable returns (bytes memory);


  // The approx amount of gas required to purchase a key
  function estimatedGasForPurchase()
    external
    view
    returns (uint);

  /**
   * Helper to get the network mining basefee as introduced in EIP-1559
   * @dev this helper can be wrapped in try/catch statement to avoid
   * revert in networks where EIP-1559 is not implemented
   */
  function networkBaseFee() external view returns (uint);

  // The version number of the current Unlock implementation on this network
  function unlockVersion() external pure returns (uint16);

  /**
   * @notice allows the owner to set the oracle address to use for value conversions
   * setting the _oracleAddress to address(0) removes support for the token
   * @dev This will also call update to ensure at least one datapoint has been recorded.
   */
  function setOracle(
    address _tokenAddress,
    address _oracleAddress
  ) external;

  // Initialize the Ownable contract, granting contract ownership to the specified sender
  function __initializeOwnable(address sender) external;

  /**
   * @dev Returns true if the caller is the current owner.
   */
  function isOwner() external view returns (bool);

  /**
   * @dev Returns the address of the current owner.
   */
  function owner() external view returns (address);

  /**
   * @dev Leaves the contract without owner. It will not be possible to call
   * `onlyOwner` functions anymore. Can only be called by the current owner.
   *
   * NOTE: Renouncing ownership will leave the contract without an owner,
   * thereby removing any functionality that is only available to the owner.
   */
  function renounceOwnership() external;

  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Can only be called by the current owner.
   */
  function transferOwnership(address newOwner) external;
}
