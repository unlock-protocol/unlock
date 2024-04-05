// Sources flattened with hardhat v2.20.1 https://hardhat.org

// SPDX-License-Identifier: GPL-2.0-or-later AND GPL-3.0-or-later AND MIT

// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v4.9.5

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
  /**
   * @dev Returns true if this contract implements the interface defined by
   * `interfaceId`. See the corresponding
   * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
   * to learn more about how these ids are created.
   *
   * This function call must use less than 30 000 gas.
   */
  function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File @openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol@v4.9.5

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC1155/IERC1155Receiver.sol)

pragma solidity ^0.8.0;

/**
 * @dev _Available since v3.1._
 */
interface IERC1155Receiver is IERC165 {
  /**
   * @dev Handles the receipt of a single ERC1155 token type. This function is
   * called at the end of a `safeTransferFrom` after the balance has been updated.
   *
   * NOTE: To accept the transfer, this must return
   * `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
   * (i.e. 0xf23a6e61, or its own function selector).
   *
   * @param operator The address which initiated the transfer (i.e. msg.sender)
   * @param from The address which previously owned the token
   * @param id The ID of the token being transferred
   * @param value The amount of tokens being transferred
   * @param data Additional data with no specified format
   * @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
   */
  function onERC1155Received(
    address operator,
    address from,
    uint256 id,
    uint256 value,
    bytes calldata data
  ) external returns (bytes4);

  /**
   * @dev Handles the receipt of a multiple ERC1155 token types. This function
   * is called at the end of a `safeBatchTransferFrom` after the balances have
   * been updated.
   *
   * NOTE: To accept the transfer(s), this must return
   * `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
   * (i.e. 0xbc197c81, or its own function selector).
   *
   * @param operator The address which initiated the batch transfer (i.e. msg.sender)
   * @param from The address which previously owned the token
   * @param ids An array containing ids of each token being transferred (order and length must match values array)
   * @param values An array containing amounts of each token being transferred (order and length must match ids array)
   * @param data Additional data with no specified format
   * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
   */
  function onERC1155BatchReceived(
    address operator,
    address from,
    uint256[] calldata ids,
    uint256[] calldata values,
    bytes calldata data
  ) external returns (bytes4);
}

// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.5

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
  /**
   * @dev Emitted when `value` tokens are moved from one account (`from`) to
   * another (`to`).
   *
   * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
   * @dev Emitted when the allowance of a `spender` for an `owner` is set by
   * a call to {approve}. `value` is the new allowance.
   */
  event Approval(address indexed owner, address indexed spender, uint256 value);

  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `to`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address to, uint256 amount) external returns (bool);

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(
    address owner,
    address spender
  ) external view returns (uint256);

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external returns (bool);

  /**
   * @dev Moves `amount` tokens from `from` to `to` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);
}

// File @uniswap/v3-periphery/contracts/libraries/TransferHelper.sol@v1.4.4

// Original license: SPDX_License_Identifier: GPL-2.0-or-later
pragma solidity >=0.6.0;

library TransferHelper {
  /// @notice Transfers tokens from the targeted address to the given destination
  /// @notice Errors with 'STF' if transfer fails
  /// @param token The contract address of the token to be transferred
  /// @param from The originating address from which the tokens will be transferred
  /// @param to The destination address of the transfer
  /// @param value The amount to be transferred
  function safeTransferFrom(
    address token,
    address from,
    address to,
    uint256 value
  ) internal {
    (bool success, bytes memory data) = token.call(
      abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value)
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "STF");
  }

  /// @notice Transfers tokens from msg.sender to a recipient
  /// @dev Errors with ST if transfer fails
  /// @param token The contract address of the token which will be transferred
  /// @param to The recipient of the transfer
  /// @param value The value of the transfer
  function safeTransfer(address token, address to, uint256 value) internal {
    (bool success, bytes memory data) = token.call(
      abi.encodeWithSelector(IERC20.transfer.selector, to, value)
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "ST");
  }

  /// @notice Approves the stipulated contract to spend the given allowance in the given token
  /// @dev Errors with 'SA' if transfer fails
  /// @param token The contract address of the token to be approved
  /// @param to The target of the approval
  /// @param value The amount of the given token the target will be allowed to spend
  function safeApprove(address token, address to, uint256 value) internal {
    (bool success, bytes memory data) = token.call(
      abi.encodeWithSelector(IERC20.approve.selector, to, value)
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "SA");
  }

  /// @notice Transfers ETH to the recipient address
  /// @dev Fails with `STE`
  /// @param to The destination of the transfer
  /// @param value The value to be transferred
  function safeTransferETH(address to, uint256 value) internal {
    (bool success, ) = to.call{value: value}(new bytes(0));
    require(success, "STE");
  }
}

// File @openzeppelin/contracts/token/ERC721/IERC721Receiver.sol@v4.9.5

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC721/IERC721Receiver.sol)

pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
  /**
   * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
   * by `operator` from `from`, this function is called.
   *
   * It must return its Solidity selector to confirm the token transfer.
   * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
   *
   * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
   */
  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata data
  ) external returns (bytes4);
}

// File contracts/interfaces/IUniversalRouter.sol

// Original license: SPDX_License_Identifier: GPL-3.0-or-later
pragma solidity ^0.8.17;

interface IUniversalRouter is IERC721Receiver, IERC1155Receiver {
  /// @notice Thrown when a required command has failed
  error ExecutionFailed(uint256 commandIndex, bytes message);

  /// @notice Thrown when attempting to send ETH directly to the contract
  error ETHNotAccepted();

  /// @notice Thrown when executing commands with an expired deadline
  error TransactionDeadlinePassed();

  /// @notice Thrown when attempting to execute commands and an incorrect number of inputs are provided
  error LengthMismatch();

  /// @notice Executes encoded commands along with provided inputs.
  /// @param commands A set of concatenated commands, each 1 byte in length
  /// @param inputs An array of byte strings containing abi encoded inputs for each command
  function execute(
    bytes calldata commands,
    bytes[] calldata inputs
  ) external payable;

  /// @notice Executes encoded commands along with provided inputs. Reverts if deadline has expired.
  /// @param commands A set of concatenated commands, each 1 byte in length
  /// @param inputs An array of byte strings containing abi encoded inputs for each command
  /// @param deadline The deadline by which the transaction must be executed
  function execute(
    bytes calldata commands,
    bytes[] calldata inputs,
    uint256 deadline
  ) external payable;
}

// File contracts/interfaces/IMintableERC20.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

interface IMintableERC20 {
  function mint(address account, uint256 amount) external returns (bool);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  function approve(address spender, uint256 amount) external returns (bool);

  function decimals() external view returns (uint8);
}

// File contracts/interfaces/IPermit2.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.5.17 <0.9.0;

interface IPermit2 {
  function approve(
    address token,
    address spender,
    uint160 amount,
    uint48 expiration
  ) external;
}

// File contracts/interfaces/IUnlock.sol

// Original license: SPDX_License_Identifier: MIT
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
   * @return _proxyAdminAddress the address of the ProxyAdmin instance
   */
  function proxyAdminAddress()
    external
    view
    returns (address _proxyAdminAddress);

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
  function createUpgradeableLock(bytes memory data) external returns (address);

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
  function globalBaseTokenURI() external view returns (string memory);

  /**
   * @dev Redundant with globalBaseTokenURI() for backwards compatibility with v3 & v4 locks.
   */
  function getGlobalBaseTokenURI() external view returns (string memory);

  // Function to read the globalTokenSymbol field.
  function globalTokenSymbol() external view returns (string memory);

  // Function to read the chainId field.
  function chainId() external view returns (uint);

  /**
   * @dev Redundant with globalTokenSymbol() for backwards compatibility with v3 & v4 locks.
   */
  function getGlobalTokenSymbol() external view returns (string memory);

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
  function addLockTemplate(address impl, uint16 version) external;

  /**
   * Match lock templates addresses with version numbers
   * @param _version the number of the version of the template
   * @return _implAddress address of the lock templates
   */
  function publicLockImpls(
    uint16 _version
  ) external view returns (address _implAddress);

  /**
   * Match version numbers with lock templates addresses
   * @param _impl the address of the deployed template contract (PublicLock)
   * @return number of the version corresponding to this address
   */
  function publicLockVersions(address _impl) external view returns (uint16);

  /**
   * Retrive the latest existing lock template version
   * @return _version the version number of the latest template (used to deploy contracts)
   */
  function publicLockLatestVersion() external view returns (uint16 _version);

  /**
   * @notice Upgrade the PublicLock template used for future calls to `createLock`.
   * @dev This will initialize the template and revokeOwnership.
   */
  function setLockTemplate(address payable _publicLockAddress) external;

  // Allows the owner to change the value tracking variables as needed.
  function resetTrackedValue(
    uint _grossNetworkProduct,
    uint _totalDiscountGranted
  ) external;

  function grossNetworkProduct() external view returns (uint);

  function totalDiscountGranted() external view returns (uint);

  function locks(
    address
  )
    external
    view
    returns (bool deployed, uint totalSales, uint yieldedDiscountTokens);

  // The address of the public lock template, used when `createLock` is called
  function publicLockAddress() external view returns (address);

  // Map token address to exchange contract address if the token is supported
  // Used for GDP calculations
  function uniswapOracles(address) external view returns (address);

  // The WETH token address, used for value calculations
  function weth() external view returns (address);

  // The UDT token address, used to mint tokens on referral
  function udt() external view returns (address);

  // The approx amount of gas required to purchase a key
  function estimatedGasForPurchase() external view returns (uint);

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
  function setOracle(address _tokenAddress, address _oracleAddress) external;

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

  /**
   * Set the fee collected by the protocol
   * @param _protocolFee fee (in basis points)
   */
  function setProtocolFee(uint _protocolFee) external;

  /**
   * The fee (in basis points) collected by the protocol on each purchase / 
   extension / renewal of a key
   * @return the protocol fee in basic point
   */
  function protocolFee() external view returns (uint);

  /**
   * Returns the ProxyAdmin contract address that manage upgrades for
   * the current Unlock contract.
   * @dev this reads the address directly from storage, at the slot `_ADMIN_SLOT`
   * defined by Open Zeppelin's EIP1967 Proxy implementation which corresponds
   * to the keccak-256 hash of "eip1967.proxy.admin" subtracted by 1
   */
  function getAdmin() external view returns (address);

  /**
   * Call executed by a lock after its version upgrade triggred by `upgradeLock`
   * - PublicLock v12 > v13 (mainnet): migrate an existing Lock to another instance
   * of the Unlock contract
   * @dev The `msg.sender` will be the upgraded lock
   */
  function postLockUpgrade() external;

  /**
   * Functions which transfers tokens held by the contract
   * It handles both ERC20 and the base currency.
   * @dev This function is onlyOwner
   * @param token the address of the token to transfer (pass the 0x0 address for the base currency)
   * @param to the address to transfer the tokens to
   * @param amount the amount of tokens to transfer
   */
  function transferTokens(address token, address to, uint256 amount) external;

  /**
   * Removes a lock from the list of locks. This will prevent the lock from being able to receive governance tokens.
   * The lock will still be able to sell its memberships.
   * @dev This function is onlyOwner
   * @param lock address of the lock to remove
   */
  function removeLock(address lock) external;

  /**
   * Send tokens held by this contract to the UDT SwapBurner contract. The tokens sent to the
   * contract are then swapped for UDT and UDT itself will be sent to a burner address.
   * @notice This function can be called by anyone (not only the contract owner) as a way to ensure decentralization.
   * @param token the address of the token (zero address for native) to swap and burn
   * @param amount the amount of tokens to swap and burn
   * @param poolFee the poolFee of the token <> WETH/Wrapped Native asset to  use for the swap
   */
  function swapAndBurn(address token, uint256 amount, uint24 poolFee) external;

  /**
   * Set the UDT Swap and Burn contract address
   * @param _swapBurnerAddress the address of the SwapBurner contract instance
   */
  function setSwapBurner(address _swapBurnerAddress) external;

  /**
   * The address of the UDT Swap and Burn contract
   */
  function swapBurnerAddress() external view returns (address);
}

// File contracts/interfaces/IWETH.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IWETH {
  function deposit() external payable;

  function transfer(address to, uint value) external returns (bool);

  function transferFrom(
    address src,
    address dst,
    uint wad
  ) external returns (bool);

  function withdraw(uint) external;

  function balanceOf(address) external returns (uint);

  function approve(address spender, uint256 amount) external returns (bool);
}

// File contracts/utils/UnlockSwapBurner.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.0;

library SafeCast160 {
  error UnsafeCast();

  /// @notice Safely casts uint256 to uint160
  /// @param value The uint256 to be cast
  function toUint160(uint256 value) internal pure returns (uint160) {
    if (value > type(uint160).max) revert UnsafeCast();
    return uint160(value);
  }
}

contract UnlockSwapBurner {
  // make sure we dont exceed type uint160 when casting
  using SafeCast160 for uint256;

  // addresses on current chain
  address public unlockAddress;

  // required by Uniswap Universal Router
  address public permit2;
  address public uniswapUniversalRouter;

  // dead address to burn
  address public constant burnAddress =
    0x000000000000000000000000000000000000dEaD;

  // specified in https://docs.uniswap.org/contracts/universal-router/technical-reference#v3_swap_exact_in
  uint256 constant V3_SWAP_EXACT_IN = 0x00;

  // events
  event SwapBurn(address tokenAddress, uint amountSpent, uint amountBurnt);

  // errors
  error UDTSwapFailed(
    address uniswapUniversalRouter,
    address tokenIn,
    uint amount
  );
  error UnauthorizedSwap();

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _unlockAddress the address of the Unlock factory contract
   * @param _permit2Address the address of Uniswap PERMIT2 contract
   */
  constructor(
    address _unlockAddress,
    address _permit2Address,
    address _uniswapUniversalRouter
  ) {
    unlockAddress = _unlockAddress;
    permit2 = _permit2Address;
    uniswapUniversalRouter = _uniswapUniversalRouter;
  }

  /**
   * Simple helper to retrieve balance in ERC20 or native tokens
   * @param token the address of the token (address(0) for native token)
   */
  function getBalance(address token) internal view returns (uint) {
    return
      token == address(0)
        ? address(this).balance
        : IMintableERC20(token).balanceOf(address(this));
  }

  /**
   * Swap tokens to UDT and burn the tokens
   */
  function swapAndBurn(
    address tokenAddress,
    uint24 poolFee
  ) public payable returns (uint amount) {
    // get info from unlock
    address udtAddress = IUnlock(unlockAddress).udt();
    address wrappedAddress = IUnlock(unlockAddress).weth();

    // get total balance of token to swap
    uint tokenAmount = getBalance(tokenAddress);
    uint udtBefore = getBalance(udtAddress);

    if (tokenAddress == udtAddress) {
      revert UnauthorizedSwap();
    }

    // wrap native tokens
    if (tokenAddress == address(0)) {
      IWETH(wrappedAddress).deposit{value: tokenAmount}();
      tokenAddress = wrappedAddress;
      tokenAmount = getBalance(tokenAddress);
    }

    // approve ERC20 spending
    if (tokenAddress != address(0)) {
      // Approve the router to spend src ERC20
      TransferHelper.safeApprove(
        tokenAddress,
        uniswapUniversalRouter,
        tokenAmount
      );

      // approve PERMIT2 to manipulate the token
      IERC20(tokenAddress).approve(permit2, tokenAmount);
    }

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      tokenAddress,
      uniswapUniversalRouter,
      tokenAmount.toUint160(),
      uint48(block.timestamp + 60) // expires after 1min
    );

    bytes memory defaultPath = abi.encodePacked(
      wrappedAddress,
      uint24(3000), // default UDT pool fee is set to 0.3%
      udtAddress
    );

    // encode parameters for the swap om UniversalRouter
    bytes memory commands = abi.encodePacked(bytes1(uint8(V3_SWAP_EXACT_IN)));
    bytes[] memory inputs = new bytes[](1);
    inputs[0] = abi.encode(
      address(this), // recipient
      tokenAmount, // amountIn
      0, // amountOutMinimum
      tokenAddress == wrappedAddress
        ? defaultPath
        : abi.encodePacked(tokenAddress, poolFee, defaultPath), // path
      true // funds are coming from PERMIT2
    );

    // Executes the swap.
    IUniversalRouter(uniswapUniversalRouter).execute(
      commands,
      inputs,
      block.timestamp + 60 // expires after 1min
    );

    // calculate how much UDT has been received
    uint amountUDTOut = getBalance(udtAddress) - udtBefore;
    if (amountUDTOut == 0) {
      revert UDTSwapFailed(uniswapUniversalRouter, tokenAddress, tokenAmount);
    }

    // burn the newly recevied UDT
    bool success = IERC20(udtAddress).transfer(burnAddress, amountUDTOut);
    if (success == false) {
      revert UDTSwapFailed(uniswapUniversalRouter, tokenAddress, tokenAmount);
    } else {
      emit SwapBurn(tokenAddress, tokenAmount, amountUDTOut);
    }

    return amountUDTOut;
  }

  // required to withdraw WETH
  receive() external payable {}
}
