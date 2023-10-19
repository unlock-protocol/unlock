// Sources flattened with hardhat v2.15.0 https://hardhat.org
// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol@v4.9.3
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IAccessControlUpgradeable {
  /**
   * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
   *
   * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
   * {RoleAdminChanged} not being emitted signaling this.
   *
   * _Available since v3.1._
   */
  event RoleAdminChanged(
    bytes32 indexed role,
    bytes32 indexed previousAdminRole,
    bytes32 indexed newAdminRole
  );

  /**
   * @dev Emitted when `account` is granted `role`.
   *
   * `sender` is the account that originated the contract call, an admin role
   * bearer except when using {AccessControl-_setupRole}.
   */
  event RoleGranted(
    bytes32 indexed role,
    address indexed account,
    address indexed sender
  );

  /**
   * @dev Emitted when `account` is revoked `role`.
   *
   * `sender` is the account that originated the contract call:
   *   - if using `revokeRole`, it is the admin role bearer
   *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
   */
  event RoleRevoked(
    bytes32 indexed role,
    address indexed account,
    address indexed sender
  );

  /**
   * @dev Returns `true` if `account` has been granted `role`.
   */
  function hasRole(bytes32 role, address account) external view returns (bool);

  /**
   * @dev Returns the admin role that controls `role`. See {grantRole} and
   * {revokeRole}.
   *
   * To change a role's admin, use {AccessControl-_setRoleAdmin}.
   */
  function getRoleAdmin(bytes32 role) external view returns (bytes32);

  /**
   * @dev Grants `role` to `account`.
   *
   * If `account` had not been already granted `role`, emits a {RoleGranted}
   * event.
   *
   * Requirements:
   *
   * - the caller must have ``role``'s admin role.
   */
  function grantRole(bytes32 role, address account) external;

  /**
   * @dev Revokes `role` from `account`.
   *
   * If `account` had been granted `role`, emits a {RoleRevoked} event.
   *
   * Requirements:
   *
   * - the caller must have ``role``'s admin role.
   */
  function revokeRole(bytes32 role, address account) external;

  /**
   * @dev Revokes `role` from the calling account.
   *
   * Roles are often managed via {grantRole} and {revokeRole}: this function's
   * purpose is to provide a mechanism for accounts to lose their privileges
   * if they are compromised (such as when a trusted device is misplaced).
   *
   * If the calling account had been granted `role`, emits a {RoleRevoked}
   * event.
   *
   * Requirements:
   *
   * - the caller must be `account`.
   */
  function renounceRole(bytes32 role, address account) external;
}

// File @openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library AddressUpgradeable {
  /**
   * @dev Returns true if `account` is a contract.
   *
   * [IMPORTANT]
   * ====
   * It is unsafe to assume that an address for which this function returns
   * false is an externally-owned account (EOA) and not a contract.
   *
   * Among others, `isContract` will return false for the following
   * types of addresses:
   *
   *  - an externally-owned account
   *  - a contract in construction
   *  - an address where a contract will be created
   *  - an address where a contract lived, but was destroyed
   *
   * Furthermore, `isContract` will also return true if the target contract within
   * the same transaction is already scheduled for destruction by `SELFDESTRUCT`,
   * which only has an effect at the end of a transaction.
   * ====
   *
   * [IMPORTANT]
   * ====
   * You shouldn't rely on `isContract` to protect against flash loan attacks!
   *
   * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
   * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
   * constructor.
   * ====
   */
  function isContract(address account) internal view returns (bool) {
    // This method relies on extcodesize/address.code.length, which returns 0
    // for contracts in construction, since the code is only stored at the end
    // of the constructor execution.

    return account.code.length > 0;
  }

  /**
   * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
   * `recipient`, forwarding all available gas and reverting on errors.
   *
   * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
   * of certain opcodes, possibly making contracts go over the 2300 gas limit
   * imposed by `transfer`, making them unable to receive funds via
   * `transfer`. {sendValue} removes this limitation.
   *
   * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
   *
   * IMPORTANT: because control is transferred to `recipient`, care must be
   * taken to not create reentrancy vulnerabilities. Consider using
   * {ReentrancyGuard} or the
   * https://solidity.readthedocs.io/en/v0.8.0/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
   */
  function sendValue(address payable recipient, uint256 amount) internal {
    require(address(this).balance >= amount, "Address: insufficient balance");

    (bool success, ) = recipient.call{value: amount}("");
    require(
      success,
      "Address: unable to send value, recipient may have reverted"
    );
  }

  /**
   * @dev Performs a Solidity function call using a low level `call`. A
   * plain `call` is an unsafe replacement for a function call: use this
   * function instead.
   *
   * If `target` reverts with a revert reason, it is bubbled up by this
   * function (like regular Solidity function calls).
   *
   * Returns the raw returned data. To convert to the expected return value,
   * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
   *
   * Requirements:
   *
   * - `target` must be a contract.
   * - calling `target` with `data` must not revert.
   *
   * _Available since v3.1._
   */
  function functionCall(
    address target,
    bytes memory data
  ) internal returns (bytes memory) {
    return
      functionCallWithValue(target, data, 0, "Address: low-level call failed");
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
   * `errorMessage` as a fallback revert reason when `target` reverts.
   *
   * _Available since v3.1._
   */
  function functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    return functionCallWithValue(target, data, 0, errorMessage);
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
   * but also transferring `value` wei to `target`.
   *
   * Requirements:
   *
   * - the calling contract must have an ETH balance of at least `value`.
   * - the called Solidity function must be `payable`.
   *
   * _Available since v3.1._
   */
  function functionCallWithValue(
    address target,
    bytes memory data,
    uint256 value
  ) internal returns (bytes memory) {
    return
      functionCallWithValue(
        target,
        data,
        value,
        "Address: low-level call with value failed"
      );
  }

  /**
   * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
   * with `errorMessage` as a fallback revert reason when `target` reverts.
   *
   * _Available since v3.1._
   */
  function functionCallWithValue(
    address target,
    bytes memory data,
    uint256 value,
    string memory errorMessage
  ) internal returns (bytes memory) {
    require(
      address(this).balance >= value,
      "Address: insufficient balance for call"
    );
    (bool success, bytes memory returndata) = target.call{value: value}(data);
    return
      verifyCallResultFromTarget(target, success, returndata, errorMessage);
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
   * but performing a static call.
   *
   * _Available since v3.3._
   */
  function functionStaticCall(
    address target,
    bytes memory data
  ) internal view returns (bytes memory) {
    return
      functionStaticCall(target, data, "Address: low-level static call failed");
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
   * but performing a static call.
   *
   * _Available since v3.3._
   */
  function functionStaticCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal view returns (bytes memory) {
    (bool success, bytes memory returndata) = target.staticcall(data);
    return
      verifyCallResultFromTarget(target, success, returndata, errorMessage);
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
   * but performing a delegate call.
   *
   * _Available since v3.4._
   */
  function functionDelegateCall(
    address target,
    bytes memory data
  ) internal returns (bytes memory) {
    return
      functionDelegateCall(
        target,
        data,
        "Address: low-level delegate call failed"
      );
  }

  /**
   * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
   * but performing a delegate call.
   *
   * _Available since v3.4._
   */
  function functionDelegateCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.delegatecall(data);
    return
      verifyCallResultFromTarget(target, success, returndata, errorMessage);
  }

  /**
   * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
   * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
   *
   * _Available since v4.8._
   */
  function verifyCallResultFromTarget(
    address target,
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) internal view returns (bytes memory) {
    if (success) {
      if (returndata.length == 0) {
        // only check isContract if the call was successful and the return data is empty
        // otherwise we already know that it was a contract
        require(isContract(target), "Address: call to non-contract");
      }
      return returndata;
    } else {
      _revert(returndata, errorMessage);
    }
  }

  /**
   * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
   * revert reason or using the provided one.
   *
   * _Available since v4.3._
   */
  function verifyCallResult(
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) internal pure returns (bytes memory) {
    if (success) {
      return returndata;
    } else {
      _revert(returndata, errorMessage);
    }
  }

  function _revert(
    bytes memory returndata,
    string memory errorMessage
  ) private pure {
    // Look for revert reason and bubble it up if present
    if (returndata.length > 0) {
      // The easiest way to bubble the revert reason is using memory via assembly
      /// @solidity memory-safe-assembly
      assembly {
        let returndata_size := mload(returndata)
        revert(add(32, returndata), returndata_size)
      }
    } else {
      revert(errorMessage);
    }
  }
}

// File @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (proxy/utils/Initializable.sol)

pragma solidity ^0.8.2;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```solidity
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 *
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
  /**
   * @dev Indicates that the contract has been initialized.
   * @custom:oz-retyped-from bool
   */
  uint8 private _initialized;

  /**
   * @dev Indicates that the contract is in the process of being initialized.
   */
  bool private _initializing;

  /**
   * @dev Triggered when the contract has been initialized or reinitialized.
   */
  event Initialized(uint8 version);

  /**
   * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
   * `onlyInitializing` functions can be used to initialize parent contracts.
   *
   * Similar to `reinitializer(1)`, except that functions marked with `initializer` can be nested in the context of a
   * constructor.
   *
   * Emits an {Initialized} event.
   */
  modifier initializer() {
    bool isTopLevelCall = !_initializing;
    require(
      (isTopLevelCall && _initialized < 1) ||
        (!AddressUpgradeable.isContract(address(this)) && _initialized == 1),
      "Initializable: contract is already initialized"
    );
    _initialized = 1;
    if (isTopLevelCall) {
      _initializing = true;
    }
    _;
    if (isTopLevelCall) {
      _initializing = false;
      emit Initialized(1);
    }
  }

  /**
   * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
   * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
   * used to initialize parent contracts.
   *
   * A reinitializer may be used after the original initialization step. This is essential to configure modules that
   * are added through upgrades and that require initialization.
   *
   * When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
   * cannot be nested. If one is invoked in the context of another, execution will revert.
   *
   * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
   * a contract, executing them in the right order is up to the developer or operator.
   *
   * WARNING: setting the version to 255 will prevent any future reinitialization.
   *
   * Emits an {Initialized} event.
   */
  modifier reinitializer(uint8 version) {
    require(
      !_initializing && _initialized < version,
      "Initializable: contract is already initialized"
    );
    _initialized = version;
    _initializing = true;
    _;
    _initializing = false;
    emit Initialized(version);
  }

  /**
   * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
   * {initializer} and {reinitializer} modifiers, directly or indirectly.
   */
  modifier onlyInitializing() {
    require(_initializing, "Initializable: contract is not initializing");
    _;
  }

  /**
   * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
   * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
   * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
   * through proxies.
   *
   * Emits an {Initialized} event the first time it is successfully executed.
   */
  function _disableInitializers() internal virtual {
    require(!_initializing, "Initializable: contract is initializing");
    if (_initialized != type(uint8).max) {
      _initialized = type(uint8).max;
      emit Initialized(type(uint8).max);
    }
  }

  /**
   * @dev Returns the highest version that has been initialized. See {reinitializer}.
   */
  function _getInitializedVersion() internal view returns (uint8) {
    return _initialized;
  }

  /**
   * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
   */
  function _isInitializing() internal view returns (bool) {
    return _initializing;
  }
}

// File @openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
  function __Context_init() internal onlyInitializing {}

  function __Context_init_unchained() internal onlyInitializing {}

  function _msgSender() internal view virtual returns (address) {
    return msg.sender;
  }

  function _msgData() internal view virtual returns (bytes calldata) {
    return msg.data;
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}

// File @openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol@v4.9.3

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
interface IERC165Upgradeable {
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

// File @openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (utils/introspection/ERC165.sol)

pragma solidity ^0.8.0;

/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 *
 * Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation.
 */
abstract contract ERC165Upgradeable is Initializable, IERC165Upgradeable {
  function __ERC165_init() internal onlyInitializing {}

  function __ERC165_init_unchained() internal onlyInitializing {}

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return interfaceId == type(IERC165Upgradeable).interfaceId;
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}

// File @openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/Math.sol)

pragma solidity ^0.8.0;

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library MathUpgradeable {
  enum Rounding {
    Down, // Toward negative infinity
    Up, // Toward infinity
    Zero // Toward zero
  }

  /**
   * @dev Returns the largest of two numbers.
   */
  function max(uint256 a, uint256 b) internal pure returns (uint256) {
    return a > b ? a : b;
  }

  /**
   * @dev Returns the smallest of two numbers.
   */
  function min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }

  /**
   * @dev Returns the average of two numbers. The result is rounded towards
   * zero.
   */
  function average(uint256 a, uint256 b) internal pure returns (uint256) {
    // (a + b) / 2 can overflow.
    return (a & b) + (a ^ b) / 2;
  }

  /**
   * @dev Returns the ceiling of the division of two numbers.
   *
   * This differs from standard division with `/` in that it rounds up instead
   * of rounding down.
   */
  function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
    // (a + b - 1) / b can overflow on addition, so we distribute.
    return a == 0 ? 0 : (a - 1) / b + 1;
  }

  /**
   * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
   * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
   * with further edits by Uniswap Labs also under MIT license.
   */
  function mulDiv(
    uint256 x,
    uint256 y,
    uint256 denominator
  ) internal pure returns (uint256 result) {
    unchecked {
      // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
      // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
      // variables such that product = prod1 * 2^256 + prod0.
      uint256 prod0; // Least significant 256 bits of the product
      uint256 prod1; // Most significant 256 bits of the product
      assembly {
        let mm := mulmod(x, y, not(0))
        prod0 := mul(x, y)
        prod1 := sub(sub(mm, prod0), lt(mm, prod0))
      }

      // Handle non-overflow cases, 256 by 256 division.
      if (prod1 == 0) {
        // Solidity will revert if denominator == 0, unlike the div opcode on its own.
        // The surrounding unchecked block does not change this fact.
        // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
        return prod0 / denominator;
      }

      // Make sure the result is less than 2^256. Also prevents denominator == 0.
      require(denominator > prod1, "Math: mulDiv overflow");

      ///////////////////////////////////////////////
      // 512 by 256 division.
      ///////////////////////////////////////////////

      // Make division exact by subtracting the remainder from [prod1 prod0].
      uint256 remainder;
      assembly {
        // Compute remainder using mulmod.
        remainder := mulmod(x, y, denominator)

        // Subtract 256 bit number from 512 bit number.
        prod1 := sub(prod1, gt(remainder, prod0))
        prod0 := sub(prod0, remainder)
      }

      // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
      // See https://cs.stackexchange.com/q/138556/92363.

      // Does not overflow because the denominator cannot be zero at this stage in the function.
      uint256 twos = denominator & (~denominator + 1);
      assembly {
        // Divide denominator by twos.
        denominator := div(denominator, twos)

        // Divide [prod1 prod0] by twos.
        prod0 := div(prod0, twos)

        // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
        twos := add(div(sub(0, twos), twos), 1)
      }

      // Shift in bits from prod1 into prod0.
      prod0 |= prod1 * twos;

      // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
      // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
      // four bits. That is, denominator * inv = 1 mod 2^4.
      uint256 inverse = (3 * denominator) ^ 2;

      // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
      // in modular arithmetic, doubling the correct bits in each step.
      inverse *= 2 - denominator * inverse; // inverse mod 2^8
      inverse *= 2 - denominator * inverse; // inverse mod 2^16
      inverse *= 2 - denominator * inverse; // inverse mod 2^32
      inverse *= 2 - denominator * inverse; // inverse mod 2^64
      inverse *= 2 - denominator * inverse; // inverse mod 2^128
      inverse *= 2 - denominator * inverse; // inverse mod 2^256

      // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
      // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
      // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
      // is no longer required.
      result = prod0 * inverse;
      return result;
    }
  }

  /**
   * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
   */
  function mulDiv(
    uint256 x,
    uint256 y,
    uint256 denominator,
    Rounding rounding
  ) internal pure returns (uint256) {
    uint256 result = mulDiv(x, y, denominator);
    if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
      result += 1;
    }
    return result;
  }

  /**
   * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
   *
   * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
   */
  function sqrt(uint256 a) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }

    // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
    //
    // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
    // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
    //
    // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
    // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
    // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
    //
    // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
    uint256 result = 1 << (log2(a) >> 1);

    // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
    // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
    // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
    // into the expected uint128 result.
    unchecked {
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      result = (result + a / result) >> 1;
      return min(result, a / result);
    }
  }

  /**
   * @notice Calculates sqrt(a), following the selected rounding direction.
   */
  function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
    unchecked {
      uint256 result = sqrt(a);
      return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
    }
  }

  /**
   * @dev Return the log in base 2, rounded down, of a positive value.
   * Returns 0 if given 0.
   */
  function log2(uint256 value) internal pure returns (uint256) {
    uint256 result = 0;
    unchecked {
      if (value >> 128 > 0) {
        value >>= 128;
        result += 128;
      }
      if (value >> 64 > 0) {
        value >>= 64;
        result += 64;
      }
      if (value >> 32 > 0) {
        value >>= 32;
        result += 32;
      }
      if (value >> 16 > 0) {
        value >>= 16;
        result += 16;
      }
      if (value >> 8 > 0) {
        value >>= 8;
        result += 8;
      }
      if (value >> 4 > 0) {
        value >>= 4;
        result += 4;
      }
      if (value >> 2 > 0) {
        value >>= 2;
        result += 2;
      }
      if (value >> 1 > 0) {
        result += 1;
      }
    }
    return result;
  }

  /**
   * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
   * Returns 0 if given 0.
   */
  function log2(
    uint256 value,
    Rounding rounding
  ) internal pure returns (uint256) {
    unchecked {
      uint256 result = log2(value);
      return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
    }
  }

  /**
   * @dev Return the log in base 10, rounded down, of a positive value.
   * Returns 0 if given 0.
   */
  function log10(uint256 value) internal pure returns (uint256) {
    uint256 result = 0;
    unchecked {
      if (value >= 10 ** 64) {
        value /= 10 ** 64;
        result += 64;
      }
      if (value >= 10 ** 32) {
        value /= 10 ** 32;
        result += 32;
      }
      if (value >= 10 ** 16) {
        value /= 10 ** 16;
        result += 16;
      }
      if (value >= 10 ** 8) {
        value /= 10 ** 8;
        result += 8;
      }
      if (value >= 10 ** 4) {
        value /= 10 ** 4;
        result += 4;
      }
      if (value >= 10 ** 2) {
        value /= 10 ** 2;
        result += 2;
      }
      if (value >= 10 ** 1) {
        result += 1;
      }
    }
    return result;
  }

  /**
   * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
   * Returns 0 if given 0.
   */
  function log10(
    uint256 value,
    Rounding rounding
  ) internal pure returns (uint256) {
    unchecked {
      uint256 result = log10(value);
      return result + (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
    }
  }

  /**
   * @dev Return the log in base 256, rounded down, of a positive value.
   * Returns 0 if given 0.
   *
   * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
   */
  function log256(uint256 value) internal pure returns (uint256) {
    uint256 result = 0;
    unchecked {
      if (value >> 128 > 0) {
        value >>= 128;
        result += 16;
      }
      if (value >> 64 > 0) {
        value >>= 64;
        result += 8;
      }
      if (value >> 32 > 0) {
        value >>= 32;
        result += 4;
      }
      if (value >> 16 > 0) {
        value >>= 16;
        result += 2;
      }
      if (value >> 8 > 0) {
        result += 1;
      }
    }
    return result;
  }

  /**
   * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
   * Returns 0 if given 0.
   */
  function log256(
    uint256 value,
    Rounding rounding
  ) internal pure returns (uint256) {
    unchecked {
      uint256 result = log256(value);
      return
        result +
        (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
    }
  }
}

// File @openzeppelin/contracts-upgradeable/utils/math/SignedMathUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/SignedMath.sol)

pragma solidity ^0.8.0;

/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMathUpgradeable {
  /**
   * @dev Returns the largest of two signed numbers.
   */
  function max(int256 a, int256 b) internal pure returns (int256) {
    return a > b ? a : b;
  }

  /**
   * @dev Returns the smallest of two signed numbers.
   */
  function min(int256 a, int256 b) internal pure returns (int256) {
    return a < b ? a : b;
  }

  /**
   * @dev Returns the average of two signed numbers without overflow.
   * The result is rounded towards zero.
   */
  function average(int256 a, int256 b) internal pure returns (int256) {
    // Formula from the book "Hacker's Delight"
    int256 x = (a & b) + ((a ^ b) >> 1);
    return x + (int256(uint256(x) >> 255) & (a ^ b));
  }

  /**
   * @dev Returns the absolute unsigned value of a signed value.
   */
  function abs(int256 n) internal pure returns (uint256) {
    unchecked {
      // must be unchecked in order to support `n = type(int256).min`
      return uint256(n >= 0 ? n : -n);
    }
  }
}

// File @openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Strings.sol)

pragma solidity ^0.8.0;

/**
 * @dev String operations.
 */
library StringsUpgradeable {
  bytes16 private constant _SYMBOLS = "0123456789abcdef";
  uint8 private constant _ADDRESS_LENGTH = 20;

  /**
   * @dev Converts a `uint256` to its ASCII `string` decimal representation.
   */
  function toString(uint256 value) internal pure returns (string memory) {
    unchecked {
      uint256 length = MathUpgradeable.log10(value) + 1;
      string memory buffer = new string(length);
      uint256 ptr;
      /// @solidity memory-safe-assembly
      assembly {
        ptr := add(buffer, add(32, length))
      }
      while (true) {
        ptr--;
        /// @solidity memory-safe-assembly
        assembly {
          mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
        }
        value /= 10;
        if (value == 0) break;
      }
      return buffer;
    }
  }

  /**
   * @dev Converts a `int256` to its ASCII `string` decimal representation.
   */
  function toString(int256 value) internal pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          value < 0 ? "-" : "",
          toString(SignedMathUpgradeable.abs(value))
        )
      );
  }

  /**
   * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
   */
  function toHexString(uint256 value) internal pure returns (string memory) {
    unchecked {
      return toHexString(value, MathUpgradeable.log256(value) + 1);
    }
  }

  /**
   * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
   */
  function toHexString(
    uint256 value,
    uint256 length
  ) internal pure returns (string memory) {
    bytes memory buffer = new bytes(2 * length + 2);
    buffer[0] = "0";
    buffer[1] = "x";
    for (uint256 i = 2 * length + 1; i > 1; --i) {
      buffer[i] = _SYMBOLS[value & 0xf];
      value >>= 4;
    }
    require(value == 0, "Strings: hex length insufficient");
    return string(buffer);
  }

  /**
   * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
   */
  function toHexString(address addr) internal pure returns (string memory) {
    return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
  }

  /**
   * @dev Returns true if the two strings are equal.
   */
  function equal(
    string memory a,
    string memory b
  ) internal pure returns (bool) {
    return keccak256(bytes(a)) == keccak256(bytes(b));
  }
}

// File @openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (access/AccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControlUpgradeable is
  Initializable,
  ContextUpgradeable,
  IAccessControlUpgradeable,
  ERC165Upgradeable
{
  function __AccessControl_init() internal onlyInitializing {}

  function __AccessControl_init_unchained() internal onlyInitializing {}

  struct RoleData {
    mapping(address => bool) members;
    bytes32 adminRole;
  }

  mapping(bytes32 => RoleData) private _roles;

  bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

  /**
   * @dev Modifier that checks that an account has a specific role. Reverts
   * with a standardized message including the required role.
   *
   * The format of the revert reason is given by the following regular expression:
   *
   *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
   *
   * _Available since v4.1._
   */
  modifier onlyRole(bytes32 role) {
    _checkRole(role);
    _;
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return
      interfaceId == type(IAccessControlUpgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @dev Returns `true` if `account` has been granted `role`.
   */
  function hasRole(
    bytes32 role,
    address account
  ) public view virtual override returns (bool) {
    return _roles[role].members[account];
  }

  /**
   * @dev Revert with a standard message if `_msgSender()` is missing `role`.
   * Overriding this function changes the behavior of the {onlyRole} modifier.
   *
   * Format of the revert message is described in {_checkRole}.
   *
   * _Available since v4.6._
   */
  function _checkRole(bytes32 role) internal view virtual {
    _checkRole(role, _msgSender());
  }

  /**
   * @dev Revert with a standard message if `account` is missing `role`.
   *
   * The format of the revert reason is given by the following regular expression:
   *
   *  /^AccessControl: account (0x[0-9a-f]{40}) is missing role (0x[0-9a-f]{64})$/
   */
  function _checkRole(bytes32 role, address account) internal view virtual {
    if (!hasRole(role, account)) {
      revert(
        string(
          abi.encodePacked(
            "AccessControl: account ",
            StringsUpgradeable.toHexString(account),
            " is missing role ",
            StringsUpgradeable.toHexString(uint256(role), 32)
          )
        )
      );
    }
  }

  /**
   * @dev Returns the admin role that controls `role`. See {grantRole} and
   * {revokeRole}.
   *
   * To change a role's admin, use {_setRoleAdmin}.
   */
  function getRoleAdmin(
    bytes32 role
  ) public view virtual override returns (bytes32) {
    return _roles[role].adminRole;
  }

  /**
   * @dev Grants `role` to `account`.
   *
   * If `account` had not been already granted `role`, emits a {RoleGranted}
   * event.
   *
   * Requirements:
   *
   * - the caller must have ``role``'s admin role.
   *
   * May emit a {RoleGranted} event.
   */
  function grantRole(
    bytes32 role,
    address account
  ) public virtual override onlyRole(getRoleAdmin(role)) {
    _grantRole(role, account);
  }

  /**
   * @dev Revokes `role` from `account`.
   *
   * If `account` had been granted `role`, emits a {RoleRevoked} event.
   *
   * Requirements:
   *
   * - the caller must have ``role``'s admin role.
   *
   * May emit a {RoleRevoked} event.
   */
  function revokeRole(
    bytes32 role,
    address account
  ) public virtual override onlyRole(getRoleAdmin(role)) {
    _revokeRole(role, account);
  }

  /**
   * @dev Revokes `role` from the calling account.
   *
   * Roles are often managed via {grantRole} and {revokeRole}: this function's
   * purpose is to provide a mechanism for accounts to lose their privileges
   * if they are compromised (such as when a trusted device is misplaced).
   *
   * If the calling account had been revoked `role`, emits a {RoleRevoked}
   * event.
   *
   * Requirements:
   *
   * - the caller must be `account`.
   *
   * May emit a {RoleRevoked} event.
   */
  function renounceRole(bytes32 role, address account) public virtual override {
    require(
      account == _msgSender(),
      "AccessControl: can only renounce roles for self"
    );

    _revokeRole(role, account);
  }

  /**
   * @dev Grants `role` to `account`.
   *
   * If `account` had not been already granted `role`, emits a {RoleGranted}
   * event. Note that unlike {grantRole}, this function doesn't perform any
   * checks on the calling account.
   *
   * May emit a {RoleGranted} event.
   *
   * [WARNING]
   * ====
   * This function should only be called from the constructor when setting
   * up the initial roles for the system.
   *
   * Using this function in any other way is effectively circumventing the admin
   * system imposed by {AccessControl}.
   * ====
   *
   * NOTE: This function is deprecated in favor of {_grantRole}.
   */
  function _setupRole(bytes32 role, address account) internal virtual {
    _grantRole(role, account);
  }

  /**
   * @dev Sets `adminRole` as ``role``'s admin role.
   *
   * Emits a {RoleAdminChanged} event.
   */
  function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
    bytes32 previousAdminRole = getRoleAdmin(role);
    _roles[role].adminRole = adminRole;
    emit RoleAdminChanged(role, previousAdminRole, adminRole);
  }

  /**
   * @dev Grants `role` to `account`.
   *
   * Internal function without access restriction.
   *
   * May emit a {RoleGranted} event.
   */
  function _grantRole(bytes32 role, address account) internal virtual {
    if (!hasRole(role, account)) {
      _roles[role].members[account] = true;
      emit RoleGranted(role, account, _msgSender());
    }
  }

  /**
   * @dev Revokes `role` from `account`.
   *
   * Internal function without access restriction.
   *
   * May emit a {RoleRevoked} event.
   */
  function _revokeRole(bytes32 role, address account) internal virtual {
    if (hasRole(role, account)) {
      _roles[role].members[account] = false;
      emit RoleRevoked(role, account, _msgSender());
    }
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[49] private __gap;
}

// File @openzeppelin/contracts-upgradeable/interfaces/IERC165Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (interfaces/IERC165.sol)

pragma solidity ^0.8.0;

// File @openzeppelin/contracts-upgradeable/interfaces/IERC6372Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (interfaces/IERC6372.sol)

pragma solidity ^0.8.0;

interface IERC6372Upgradeable {
  /**
   * @dev Clock used for flagging checkpoints. Can be overridden to implement timestamp based checkpoints (and voting).
   */
  function clock() external view returns (uint48);

  /**
   * @dev Description of the clock
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() external view returns (string memory);
}

// File @openzeppelin/contracts-upgradeable/governance/IGovernorUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/IGovernor.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the {Governor} core.
 *
 * _Available since v4.3._
 */
abstract contract IGovernorUpgradeable is
  Initializable,
  IERC165Upgradeable,
  IERC6372Upgradeable
{
  function __IGovernor_init() internal onlyInitializing {}

  function __IGovernor_init_unchained() internal onlyInitializing {}

  enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed
  }

  /**
   * @dev Emitted when a proposal is created.
   */
  event ProposalCreated(
    uint256 proposalId,
    address proposer,
    address[] targets,
    uint256[] values,
    string[] signatures,
    bytes[] calldatas,
    uint256 voteStart,
    uint256 voteEnd,
    string description
  );

  /**
   * @dev Emitted when a proposal is canceled.
   */
  event ProposalCanceled(uint256 proposalId);

  /**
   * @dev Emitted when a proposal is executed.
   */
  event ProposalExecuted(uint256 proposalId);

  /**
   * @dev Emitted when a vote is cast without params.
   *
   * Note: `support` values should be seen as buckets. Their interpretation depends on the voting module used.
   */
  event VoteCast(
    address indexed voter,
    uint256 proposalId,
    uint8 support,
    uint256 weight,
    string reason
  );

  /**
   * @dev Emitted when a vote is cast with params.
   *
   * Note: `support` values should be seen as buckets. Their interpretation depends on the voting module used.
   * `params` are additional encoded parameters. Their interpepretation also depends on the voting module used.
   */
  event VoteCastWithParams(
    address indexed voter,
    uint256 proposalId,
    uint8 support,
    uint256 weight,
    string reason,
    bytes params
  );

  /**
   * @notice module:core
   * @dev Name of the governor instance (used in building the ERC712 domain separator).
   */
  function name() public view virtual returns (string memory);

  /**
   * @notice module:core
   * @dev Version of the governor instance (used in building the ERC712 domain separator). Default: "1"
   */
  function version() public view virtual returns (string memory);

  /**
   * @notice module:core
   * @dev See {IERC6372}
   */
  function clock() public view virtual override returns (uint48);

  /**
   * @notice module:core
   * @dev See EIP-6372.
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() public view virtual override returns (string memory);

  /**
   * @notice module:voting
   * @dev A description of the possible `support` values for {castVote} and the way these votes are counted, meant to
   * be consumed by UIs to show correct vote options and interpret the results. The string is a URL-encoded sequence of
   * key-value pairs that each describe one aspect, for example `support=bravo&quorum=for,abstain`.
   *
   * There are 2 standard keys: `support` and `quorum`.
   *
   * - `support=bravo` refers to the vote options 0 = Against, 1 = For, 2 = Abstain, as in `GovernorBravo`.
   * - `quorum=bravo` means that only For votes are counted towards quorum.
   * - `quorum=for,abstain` means that both For and Abstain votes are counted towards quorum.
   *
   * If a counting module makes use of encoded `params`, it should  include this under a `params` key with a unique
   * name that describes the behavior. For example:
   *
   * - `params=fractional` might refer to a scheme where votes are divided fractionally between for/against/abstain.
   * - `params=erc721` might refer to a scheme where specific NFTs are delegated to vote.
   *
   * NOTE: The string can be decoded by the standard
   * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams[`URLSearchParams`]
   * JavaScript class.
   */
  // solhint-disable-next-line func-name-mixedcase
  function COUNTING_MODE() public view virtual returns (string memory);

  /**
   * @notice module:core
   * @dev Hashing function used to (re)build the proposal id from the proposal details..
   */
  function hashProposal(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public pure virtual returns (uint256);

  /**
   * @notice module:core
   * @dev Current state of a proposal, following Compound's convention
   */
  function state(
    uint256 proposalId
  ) public view virtual returns (ProposalState);

  /**
   * @notice module:core
   * @dev Timepoint used to retrieve user's votes and quorum. If using block number (as per Compound's Comp), the
   * snapshot is performed at the end of this block. Hence, voting for this proposal starts at the beginning of the
   * following block.
   */
  function proposalSnapshot(
    uint256 proposalId
  ) public view virtual returns (uint256);

  /**
   * @notice module:core
   * @dev Timepoint at which votes close. If using block number, votes close at the end of this block, so it is
   * possible to cast a vote during this block.
   */
  function proposalDeadline(
    uint256 proposalId
  ) public view virtual returns (uint256);

  /**
   * @notice module:core
   * @dev The account that created a proposal.
   */
  function proposalProposer(
    uint256 proposalId
  ) public view virtual returns (address);

  /**
   * @notice module:user-config
   * @dev Delay, between the proposal is created and the vote starts. The unit this duration is expressed in depends
   * on the clock (see EIP-6372) this contract uses.
   *
   * This can be increased to leave time for users to buy voting power, or delegate it, before the voting of a
   * proposal starts.
   */
  function votingDelay() public view virtual returns (uint256);

  /**
   * @notice module:user-config
   * @dev Delay between the vote start and vote end. The unit this duration is expressed in depends on the clock
   * (see EIP-6372) this contract uses.
   *
   * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
   * duration compared to the voting delay.
   */
  function votingPeriod() public view virtual returns (uint256);

  /**
   * @notice module:user-config
   * @dev Minimum number of cast voted required for a proposal to be successful.
   *
   * NOTE: The `timepoint` parameter corresponds to the snapshot used for counting vote. This allows to scale the
   * quorum depending on values such as the totalSupply of a token at this timepoint (see {ERC20Votes}).
   */
  function quorum(uint256 timepoint) public view virtual returns (uint256);

  /**
   * @notice module:reputation
   * @dev Voting power of an `account` at a specific `timepoint`.
   *
   * Note: this can be implemented in a number of ways, for example by reading the delegated balance from one (or
   * multiple), {ERC20Votes} tokens.
   */
  function getVotes(
    address account,
    uint256 timepoint
  ) public view virtual returns (uint256);

  /**
   * @notice module:reputation
   * @dev Voting power of an `account` at a specific `timepoint` given additional encoded parameters.
   */
  function getVotesWithParams(
    address account,
    uint256 timepoint,
    bytes memory params
  ) public view virtual returns (uint256);

  /**
   * @notice module:voting
   * @dev Returns whether `account` has cast a vote on `proposalId`.
   */
  function hasVoted(
    uint256 proposalId,
    address account
  ) public view virtual returns (bool);

  /**
   * @dev Create a new proposal. Vote start after a delay specified by {IGovernor-votingDelay} and lasts for a
   * duration specified by {IGovernor-votingPeriod}.
   *
   * Emits a {ProposalCreated} event.
   */
  function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
  ) public virtual returns (uint256 proposalId);

  /**
   * @dev Execute a successful proposal. This requires the quorum to be reached, the vote to be successful, and the
   * deadline to be reached.
   *
   * Emits a {ProposalExecuted} event.
   *
   * Note: some module can modify the requirements for execution, for example by adding an additional timelock.
   */
  function execute(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public payable virtual returns (uint256 proposalId);

  /**
   * @dev Cancel a proposal. A proposal is cancellable by the proposer, but only while it is Pending state, i.e.
   * before the vote starts.
   *
   * Emits a {ProposalCanceled} event.
   */
  function cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public virtual returns (uint256 proposalId);

  /**
   * @dev Cast a vote
   *
   * Emits a {VoteCast} event.
   */
  function castVote(
    uint256 proposalId,
    uint8 support
  ) public virtual returns (uint256 balance);

  /**
   * @dev Cast a vote with a reason
   *
   * Emits a {VoteCast} event.
   */
  function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string calldata reason
  ) public virtual returns (uint256 balance);

  /**
   * @dev Cast a vote with a reason and additional encoded parameters
   *
   * Emits a {VoteCast} or {VoteCastWithParams} event depending on the length of params.
   */
  function castVoteWithReasonAndParams(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    bytes memory params
  ) public virtual returns (uint256 balance);

  /**
   * @dev Cast a vote using the user's cryptographic signature.
   *
   * Emits a {VoteCast} event.
   */
  function castVoteBySig(
    uint256 proposalId,
    uint8 support,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public virtual returns (uint256 balance);

  /**
   * @dev Cast a vote with a reason and additional encoded parameters using the user's cryptographic signature.
   *
   * Emits a {VoteCast} or {VoteCastWithParams} event depending on the length of params.
   */
  function castVoteWithReasonAndParamsBySig(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    bytes memory params,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public virtual returns (uint256 balance);

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}

// File @openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC1155/IERC1155Receiver.sol)

pragma solidity ^0.8.0;

/**
 * @dev _Available since v3.1._
 */
interface IERC1155ReceiverUpgradeable is IERC165Upgradeable {
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

// File @openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC721/IERC721Receiver.sol)

pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721ReceiverUpgradeable {
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

// File @openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/cryptography/ECDSA.sol)

pragma solidity ^0.8.0;

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */
library ECDSAUpgradeable {
  enum RecoverError {
    NoError,
    InvalidSignature,
    InvalidSignatureLength,
    InvalidSignatureS,
    InvalidSignatureV // Deprecated in v4.8
  }

  function _throwError(RecoverError error) private pure {
    if (error == RecoverError.NoError) {
      return; // no error: do nothing
    } else if (error == RecoverError.InvalidSignature) {
      revert("ECDSA: invalid signature");
    } else if (error == RecoverError.InvalidSignatureLength) {
      revert("ECDSA: invalid signature length");
    } else if (error == RecoverError.InvalidSignatureS) {
      revert("ECDSA: invalid signature 's' value");
    }
  }

  /**
   * @dev Returns the address that signed a hashed message (`hash`) with
   * `signature` or error string. This address can then be used for verification purposes.
   *
   * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
   * this function rejects them by requiring the `s` value to be in the lower
   * half order, and the `v` value to be either 27 or 28.
   *
   * IMPORTANT: `hash` _must_ be the result of a hash operation for the
   * verification to be secure: it is possible to craft signatures that
   * recover to arbitrary addresses for non-hashed data. A safe way to ensure
   * this is by receiving a hash of the original message (which may otherwise
   * be too long), and then calling {toEthSignedMessageHash} on it.
   *
   * Documentation for signature generation:
   * - with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
   * - with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]
   *
   * _Available since v4.3._
   */
  function tryRecover(
    bytes32 hash,
    bytes memory signature
  ) internal pure returns (address, RecoverError) {
    if (signature.length == 65) {
      bytes32 r;
      bytes32 s;
      uint8 v;
      // ecrecover takes the signature parameters, and the only way to get them
      // currently is to use assembly.
      /// @solidity memory-safe-assembly
      assembly {
        r := mload(add(signature, 0x20))
        s := mload(add(signature, 0x40))
        v := byte(0, mload(add(signature, 0x60)))
      }
      return tryRecover(hash, v, r, s);
    } else {
      return (address(0), RecoverError.InvalidSignatureLength);
    }
  }

  /**
   * @dev Returns the address that signed a hashed message (`hash`) with
   * `signature`. This address can then be used for verification purposes.
   *
   * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
   * this function rejects them by requiring the `s` value to be in the lower
   * half order, and the `v` value to be either 27 or 28.
   *
   * IMPORTANT: `hash` _must_ be the result of a hash operation for the
   * verification to be secure: it is possible to craft signatures that
   * recover to arbitrary addresses for non-hashed data. A safe way to ensure
   * this is by receiving a hash of the original message (which may otherwise
   * be too long), and then calling {toEthSignedMessageHash} on it.
   */
  function recover(
    bytes32 hash,
    bytes memory signature
  ) internal pure returns (address) {
    (address recovered, RecoverError error) = tryRecover(hash, signature);
    _throwError(error);
    return recovered;
  }

  /**
   * @dev Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.
   *
   * See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]
   *
   * _Available since v4.3._
   */
  function tryRecover(
    bytes32 hash,
    bytes32 r,
    bytes32 vs
  ) internal pure returns (address, RecoverError) {
    bytes32 s = vs &
      bytes32(
        0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
      );
    uint8 v = uint8((uint256(vs) >> 255) + 27);
    return tryRecover(hash, v, r, s);
  }

  /**
   * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
   *
   * _Available since v4.2._
   */
  function recover(
    bytes32 hash,
    bytes32 r,
    bytes32 vs
  ) internal pure returns (address) {
    (address recovered, RecoverError error) = tryRecover(hash, r, vs);
    _throwError(error);
    return recovered;
  }

  /**
   * @dev Overload of {ECDSA-tryRecover} that receives the `v`,
   * `r` and `s` signature fields separately.
   *
   * _Available since v4.3._
   */
  function tryRecover(
    bytes32 hash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal pure returns (address, RecoverError) {
    // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
    // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
    // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
    // signatures from current libraries generate a unique signature with an s-value in the lower half order.
    //
    // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
    // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
    // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
    // these malleable signatures as well.
    if (
      uint256(s) >
      0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
    ) {
      return (address(0), RecoverError.InvalidSignatureS);
    }

    // If the signature is valid (and not malleable), return the signer address
    address signer = ecrecover(hash, v, r, s);
    if (signer == address(0)) {
      return (address(0), RecoverError.InvalidSignature);
    }

    return (signer, RecoverError.NoError);
  }

  /**
   * @dev Overload of {ECDSA-recover} that receives the `v`,
   * `r` and `s` signature fields separately.
   */
  function recover(
    bytes32 hash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal pure returns (address) {
    (address recovered, RecoverError error) = tryRecover(hash, v, r, s);
    _throwError(error);
    return recovered;
  }

  /**
   * @dev Returns an Ethereum Signed Message, created from a `hash`. This
   * produces hash corresponding to the one signed with the
   * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
   * JSON-RPC method as part of EIP-191.
   *
   * See {recover}.
   */
  function toEthSignedMessageHash(
    bytes32 hash
  ) internal pure returns (bytes32 message) {
    // 32 is the length in bytes of hash,
    // enforced by the type signature above
    /// @solidity memory-safe-assembly
    assembly {
      mstore(0x00, "\x19Ethereum Signed Message:\n32")
      mstore(0x1c, hash)
      message := keccak256(0x00, 0x3c)
    }
  }

  /**
   * @dev Returns an Ethereum Signed Message, created from `s`. This
   * produces hash corresponding to the one signed with the
   * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
   * JSON-RPC method as part of EIP-191.
   *
   * See {recover}.
   */
  function toEthSignedMessageHash(
    bytes memory s
  ) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          "\x19Ethereum Signed Message:\n",
          StringsUpgradeable.toString(s.length),
          s
        )
      );
  }

  /**
   * @dev Returns an Ethereum Signed Typed Data, created from a
   * `domainSeparator` and a `structHash`. This produces hash corresponding
   * to the one signed with the
   * https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`]
   * JSON-RPC method as part of EIP-712.
   *
   * See {recover}.
   */
  function toTypedDataHash(
    bytes32 domainSeparator,
    bytes32 structHash
  ) internal pure returns (bytes32 data) {
    /// @solidity memory-safe-assembly
    assembly {
      let ptr := mload(0x40)
      mstore(ptr, "\x19\x01")
      mstore(add(ptr, 0x02), domainSeparator)
      mstore(add(ptr, 0x22), structHash)
      data := keccak256(ptr, 0x42)
    }
  }

  /**
   * @dev Returns an Ethereum Signed Data with intended validator, created from a
   * `validator` and `data` according to the version 0 of EIP-191.
   *
   * See {recover}.
   */
  function toDataWithIntendedValidatorHash(
    address validator,
    bytes memory data
  ) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19\x00", validator, data));
  }
}

// File @openzeppelin/contracts-upgradeable/interfaces/IERC5267Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (interfaces/IERC5267.sol)

pragma solidity ^0.8.0;

interface IERC5267Upgradeable {
  /**
   * @dev MAY be emitted to signal that the domain could have changed.
   */
  event EIP712DomainChanged();

  /**
   * @dev returns the fields and values that describe the domain separator used by this contract for EIP-712
   * signature.
   */
  function eip712Domain()
    external
    view
    returns (
      bytes1 fields,
      string memory name,
      string memory version,
      uint256 chainId,
      address verifyingContract,
      bytes32 salt,
      uint256[] memory extensions
    );
}

// File @openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/cryptography/EIP712.sol)

pragma solidity ^0.8.8;

/**
 * @dev https://eips.ethereum.org/EIPS/eip-712[EIP 712] is a standard for hashing and signing of typed structured data.
 *
 * The encoding specified in the EIP is very generic, and such a generic implementation in Solidity is not feasible,
 * thus this contract does not implement the encoding itself. Protocols need to implement the type-specific encoding
 * they need in their contracts using a combination of `abi.encode` and `keccak256`.
 *
 * This contract implements the EIP 712 domain separator ({_domainSeparatorV4}) that is used as part of the encoding
 * scheme, and the final step of the encoding to obtain the message digest that is then signed via ECDSA
 * ({_hashTypedDataV4}).
 *
 * The implementation of the domain separator was designed to be as efficient as possible while still properly updating
 * the chain id to protect against replay attacks on an eventual fork of the chain.
 *
 * NOTE: This contract implements the version of the encoding known as "v4", as implemented by the JSON RPC method
 * https://docs.metamask.io/guide/signing-data.html[`eth_signTypedDataV4` in MetaMask].
 *
 * NOTE: In the upgradeable version of this contract, the cached values will correspond to the address, and the domain
 * separator of the implementation contract. This will cause the `_domainSeparatorV4` function to always rebuild the
 * separator from the immutable values, which is cheaper than accessing a cached version in cold storage.
 *
 * _Available since v3.4._
 *
 * @custom:storage-size 52
 */
abstract contract EIP712Upgradeable is Initializable, IERC5267Upgradeable {
  bytes32 private constant _TYPE_HASH =
    keccak256(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

  /// @custom:oz-renamed-from _HASHED_NAME
  bytes32 private _hashedName;
  /// @custom:oz-renamed-from _HASHED_VERSION
  bytes32 private _hashedVersion;

  string private _name;
  string private _version;

  /**
   * @dev Initializes the domain separator and parameter caches.
   *
   * The meaning of `name` and `version` is specified in
   * https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator[EIP 712]:
   *
   * - `name`: the user readable name of the signing domain, i.e. the name of the DApp or the protocol.
   * - `version`: the current major version of the signing domain.
   *
   * NOTE: These parameters cannot be changed except through a xref:learn::upgrading-smart-contracts.adoc[smart
   * contract upgrade].
   */
  function __EIP712_init(
    string memory name,
    string memory version
  ) internal onlyInitializing {
    __EIP712_init_unchained(name, version);
  }

  function __EIP712_init_unchained(
    string memory name,
    string memory version
  ) internal onlyInitializing {
    _name = name;
    _version = version;

    // Reset prior values in storage if upgrading
    _hashedName = 0;
    _hashedVersion = 0;
  }

  /**
   * @dev Returns the domain separator for the current chain.
   */
  function _domainSeparatorV4() internal view returns (bytes32) {
    return _buildDomainSeparator();
  }

  function _buildDomainSeparator() private view returns (bytes32) {
    return
      keccak256(
        abi.encode(
          _TYPE_HASH,
          _EIP712NameHash(),
          _EIP712VersionHash(),
          block.chainid,
          address(this)
        )
      );
  }

  /**
   * @dev Given an already https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct[hashed struct], this
   * function returns the hash of the fully encoded EIP712 message for this domain.
   *
   * This hash can be used together with {ECDSA-recover} to obtain the signer of a message. For example:
   *
   * ```solidity
   * bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
   *     keccak256("Mail(address to,string contents)"),
   *     mailTo,
   *     keccak256(bytes(mailContents))
   * )));
   * address signer = ECDSA.recover(digest, signature);
   * ```
   */
  function _hashTypedDataV4(
    bytes32 structHash
  ) internal view virtual returns (bytes32) {
    return ECDSAUpgradeable.toTypedDataHash(_domainSeparatorV4(), structHash);
  }

  /**
   * @dev See {EIP-5267}.
   *
   * _Available since v4.9._
   */
  function eip712Domain()
    public
    view
    virtual
    override
    returns (
      bytes1 fields,
      string memory name,
      string memory version,
      uint256 chainId,
      address verifyingContract,
      bytes32 salt,
      uint256[] memory extensions
    )
  {
    // If the hashed name and version in storage are non-zero, the contract hasn't been properly initialized
    // and the EIP712 domain is not reliable, as it will be missing name and version.
    require(_hashedName == 0 && _hashedVersion == 0, "EIP712: Uninitialized");

    return (
      hex"0f", // 01111
      _EIP712Name(),
      _EIP712Version(),
      block.chainid,
      address(this),
      bytes32(0),
      new uint256[](0)
    );
  }

  /**
   * @dev The name parameter for the EIP712 domain.
   *
   * NOTE: This function reads from storage by default, but can be redefined to return a constant value if gas costs
   * are a concern.
   */
  function _EIP712Name() internal view virtual returns (string memory) {
    return _name;
  }

  /**
   * @dev The version parameter for the EIP712 domain.
   *
   * NOTE: This function reads from storage by default, but can be redefined to return a constant value if gas costs
   * are a concern.
   */
  function _EIP712Version() internal view virtual returns (string memory) {
    return _version;
  }

  /**
   * @dev The hash of the name parameter for the EIP712 domain.
   *
   * NOTE: In previous versions this function was virtual. In this version you should override `_EIP712Name` instead.
   */
  function _EIP712NameHash() internal view returns (bytes32) {
    string memory name = _EIP712Name();
    if (bytes(name).length > 0) {
      return keccak256(bytes(name));
    } else {
      // If the name is empty, the contract may have been upgraded without initializing the new storage.
      // We return the name hash in storage if non-zero, otherwise we assume the name is empty by design.
      bytes32 hashedName = _hashedName;
      if (hashedName != 0) {
        return hashedName;
      } else {
        return keccak256("");
      }
    }
  }

  /**
   * @dev The hash of the version parameter for the EIP712 domain.
   *
   * NOTE: In previous versions this function was virtual. In this version you should override `_EIP712Version` instead.
   */
  function _EIP712VersionHash() internal view returns (bytes32) {
    string memory version = _EIP712Version();
    if (bytes(version).length > 0) {
      return keccak256(bytes(version));
    } else {
      // If the version is empty, the contract may have been upgraded without initializing the new storage.
      // We return the version hash in storage if non-zero, otherwise we assume the version is empty by design.
      bytes32 hashedVersion = _hashedVersion;
      if (hashedVersion != 0) {
        return hashedVersion;
      } else {
        return keccak256("");
      }
    }
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[48] private __gap;
}

// File @openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/SafeCast.sol)
// This file was procedurally generated from scripts/generate/templates/SafeCast.js.

pragma solidity ^0.8.0;

/**
 * @dev Wrappers over Solidity's uintXX/intXX casting operators with added overflow
 * checks.
 *
 * Downcasting from uint256/int256 in Solidity does not revert on overflow. This can
 * easily result in undesired exploitation or bugs, since developers usually
 * assume that overflows raise errors. `SafeCast` restores this intuition by
 * reverting the transaction when such an operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 *
 * Can be combined with {SafeMath} and {SignedSafeMath} to extend it to smaller types, by performing
 * all math on `uint256` and `int256` and then downcasting.
 */
library SafeCastUpgradeable {
  /**
   * @dev Returns the downcasted uint248 from uint256, reverting on
   * overflow (when the input is greater than largest uint248).
   *
   * Counterpart to Solidity's `uint248` operator.
   *
   * Requirements:
   *
   * - input must fit into 248 bits
   *
   * _Available since v4.7._
   */
  function toUint248(uint256 value) internal pure returns (uint248) {
    require(
      value <= type(uint248).max,
      "SafeCast: value doesn't fit in 248 bits"
    );
    return uint248(value);
  }

  /**
   * @dev Returns the downcasted uint240 from uint256, reverting on
   * overflow (when the input is greater than largest uint240).
   *
   * Counterpart to Solidity's `uint240` operator.
   *
   * Requirements:
   *
   * - input must fit into 240 bits
   *
   * _Available since v4.7._
   */
  function toUint240(uint256 value) internal pure returns (uint240) {
    require(
      value <= type(uint240).max,
      "SafeCast: value doesn't fit in 240 bits"
    );
    return uint240(value);
  }

  /**
   * @dev Returns the downcasted uint232 from uint256, reverting on
   * overflow (when the input is greater than largest uint232).
   *
   * Counterpart to Solidity's `uint232` operator.
   *
   * Requirements:
   *
   * - input must fit into 232 bits
   *
   * _Available since v4.7._
   */
  function toUint232(uint256 value) internal pure returns (uint232) {
    require(
      value <= type(uint232).max,
      "SafeCast: value doesn't fit in 232 bits"
    );
    return uint232(value);
  }

  /**
   * @dev Returns the downcasted uint224 from uint256, reverting on
   * overflow (when the input is greater than largest uint224).
   *
   * Counterpart to Solidity's `uint224` operator.
   *
   * Requirements:
   *
   * - input must fit into 224 bits
   *
   * _Available since v4.2._
   */
  function toUint224(uint256 value) internal pure returns (uint224) {
    require(
      value <= type(uint224).max,
      "SafeCast: value doesn't fit in 224 bits"
    );
    return uint224(value);
  }

  /**
   * @dev Returns the downcasted uint216 from uint256, reverting on
   * overflow (when the input is greater than largest uint216).
   *
   * Counterpart to Solidity's `uint216` operator.
   *
   * Requirements:
   *
   * - input must fit into 216 bits
   *
   * _Available since v4.7._
   */
  function toUint216(uint256 value) internal pure returns (uint216) {
    require(
      value <= type(uint216).max,
      "SafeCast: value doesn't fit in 216 bits"
    );
    return uint216(value);
  }

  /**
   * @dev Returns the downcasted uint208 from uint256, reverting on
   * overflow (when the input is greater than largest uint208).
   *
   * Counterpart to Solidity's `uint208` operator.
   *
   * Requirements:
   *
   * - input must fit into 208 bits
   *
   * _Available since v4.7._
   */
  function toUint208(uint256 value) internal pure returns (uint208) {
    require(
      value <= type(uint208).max,
      "SafeCast: value doesn't fit in 208 bits"
    );
    return uint208(value);
  }

  /**
   * @dev Returns the downcasted uint200 from uint256, reverting on
   * overflow (when the input is greater than largest uint200).
   *
   * Counterpart to Solidity's `uint200` operator.
   *
   * Requirements:
   *
   * - input must fit into 200 bits
   *
   * _Available since v4.7._
   */
  function toUint200(uint256 value) internal pure returns (uint200) {
    require(
      value <= type(uint200).max,
      "SafeCast: value doesn't fit in 200 bits"
    );
    return uint200(value);
  }

  /**
   * @dev Returns the downcasted uint192 from uint256, reverting on
   * overflow (when the input is greater than largest uint192).
   *
   * Counterpart to Solidity's `uint192` operator.
   *
   * Requirements:
   *
   * - input must fit into 192 bits
   *
   * _Available since v4.7._
   */
  function toUint192(uint256 value) internal pure returns (uint192) {
    require(
      value <= type(uint192).max,
      "SafeCast: value doesn't fit in 192 bits"
    );
    return uint192(value);
  }

  /**
   * @dev Returns the downcasted uint184 from uint256, reverting on
   * overflow (when the input is greater than largest uint184).
   *
   * Counterpart to Solidity's `uint184` operator.
   *
   * Requirements:
   *
   * - input must fit into 184 bits
   *
   * _Available since v4.7._
   */
  function toUint184(uint256 value) internal pure returns (uint184) {
    require(
      value <= type(uint184).max,
      "SafeCast: value doesn't fit in 184 bits"
    );
    return uint184(value);
  }

  /**
   * @dev Returns the downcasted uint176 from uint256, reverting on
   * overflow (when the input is greater than largest uint176).
   *
   * Counterpart to Solidity's `uint176` operator.
   *
   * Requirements:
   *
   * - input must fit into 176 bits
   *
   * _Available since v4.7._
   */
  function toUint176(uint256 value) internal pure returns (uint176) {
    require(
      value <= type(uint176).max,
      "SafeCast: value doesn't fit in 176 bits"
    );
    return uint176(value);
  }

  /**
   * @dev Returns the downcasted uint168 from uint256, reverting on
   * overflow (when the input is greater than largest uint168).
   *
   * Counterpart to Solidity's `uint168` operator.
   *
   * Requirements:
   *
   * - input must fit into 168 bits
   *
   * _Available since v4.7._
   */
  function toUint168(uint256 value) internal pure returns (uint168) {
    require(
      value <= type(uint168).max,
      "SafeCast: value doesn't fit in 168 bits"
    );
    return uint168(value);
  }

  /**
   * @dev Returns the downcasted uint160 from uint256, reverting on
   * overflow (when the input is greater than largest uint160).
   *
   * Counterpart to Solidity's `uint160` operator.
   *
   * Requirements:
   *
   * - input must fit into 160 bits
   *
   * _Available since v4.7._
   */
  function toUint160(uint256 value) internal pure returns (uint160) {
    require(
      value <= type(uint160).max,
      "SafeCast: value doesn't fit in 160 bits"
    );
    return uint160(value);
  }

  /**
   * @dev Returns the downcasted uint152 from uint256, reverting on
   * overflow (when the input is greater than largest uint152).
   *
   * Counterpart to Solidity's `uint152` operator.
   *
   * Requirements:
   *
   * - input must fit into 152 bits
   *
   * _Available since v4.7._
   */
  function toUint152(uint256 value) internal pure returns (uint152) {
    require(
      value <= type(uint152).max,
      "SafeCast: value doesn't fit in 152 bits"
    );
    return uint152(value);
  }

  /**
   * @dev Returns the downcasted uint144 from uint256, reverting on
   * overflow (when the input is greater than largest uint144).
   *
   * Counterpart to Solidity's `uint144` operator.
   *
   * Requirements:
   *
   * - input must fit into 144 bits
   *
   * _Available since v4.7._
   */
  function toUint144(uint256 value) internal pure returns (uint144) {
    require(
      value <= type(uint144).max,
      "SafeCast: value doesn't fit in 144 bits"
    );
    return uint144(value);
  }

  /**
   * @dev Returns the downcasted uint136 from uint256, reverting on
   * overflow (when the input is greater than largest uint136).
   *
   * Counterpart to Solidity's `uint136` operator.
   *
   * Requirements:
   *
   * - input must fit into 136 bits
   *
   * _Available since v4.7._
   */
  function toUint136(uint256 value) internal pure returns (uint136) {
    require(
      value <= type(uint136).max,
      "SafeCast: value doesn't fit in 136 bits"
    );
    return uint136(value);
  }

  /**
   * @dev Returns the downcasted uint128 from uint256, reverting on
   * overflow (when the input is greater than largest uint128).
   *
   * Counterpart to Solidity's `uint128` operator.
   *
   * Requirements:
   *
   * - input must fit into 128 bits
   *
   * _Available since v2.5._
   */
  function toUint128(uint256 value) internal pure returns (uint128) {
    require(
      value <= type(uint128).max,
      "SafeCast: value doesn't fit in 128 bits"
    );
    return uint128(value);
  }

  /**
   * @dev Returns the downcasted uint120 from uint256, reverting on
   * overflow (when the input is greater than largest uint120).
   *
   * Counterpart to Solidity's `uint120` operator.
   *
   * Requirements:
   *
   * - input must fit into 120 bits
   *
   * _Available since v4.7._
   */
  function toUint120(uint256 value) internal pure returns (uint120) {
    require(
      value <= type(uint120).max,
      "SafeCast: value doesn't fit in 120 bits"
    );
    return uint120(value);
  }

  /**
   * @dev Returns the downcasted uint112 from uint256, reverting on
   * overflow (when the input is greater than largest uint112).
   *
   * Counterpart to Solidity's `uint112` operator.
   *
   * Requirements:
   *
   * - input must fit into 112 bits
   *
   * _Available since v4.7._
   */
  function toUint112(uint256 value) internal pure returns (uint112) {
    require(
      value <= type(uint112).max,
      "SafeCast: value doesn't fit in 112 bits"
    );
    return uint112(value);
  }

  /**
   * @dev Returns the downcasted uint104 from uint256, reverting on
   * overflow (when the input is greater than largest uint104).
   *
   * Counterpart to Solidity's `uint104` operator.
   *
   * Requirements:
   *
   * - input must fit into 104 bits
   *
   * _Available since v4.7._
   */
  function toUint104(uint256 value) internal pure returns (uint104) {
    require(
      value <= type(uint104).max,
      "SafeCast: value doesn't fit in 104 bits"
    );
    return uint104(value);
  }

  /**
   * @dev Returns the downcasted uint96 from uint256, reverting on
   * overflow (when the input is greater than largest uint96).
   *
   * Counterpart to Solidity's `uint96` operator.
   *
   * Requirements:
   *
   * - input must fit into 96 bits
   *
   * _Available since v4.2._
   */
  function toUint96(uint256 value) internal pure returns (uint96) {
    require(
      value <= type(uint96).max,
      "SafeCast: value doesn't fit in 96 bits"
    );
    return uint96(value);
  }

  /**
   * @dev Returns the downcasted uint88 from uint256, reverting on
   * overflow (when the input is greater than largest uint88).
   *
   * Counterpart to Solidity's `uint88` operator.
   *
   * Requirements:
   *
   * - input must fit into 88 bits
   *
   * _Available since v4.7._
   */
  function toUint88(uint256 value) internal pure returns (uint88) {
    require(
      value <= type(uint88).max,
      "SafeCast: value doesn't fit in 88 bits"
    );
    return uint88(value);
  }

  /**
   * @dev Returns the downcasted uint80 from uint256, reverting on
   * overflow (when the input is greater than largest uint80).
   *
   * Counterpart to Solidity's `uint80` operator.
   *
   * Requirements:
   *
   * - input must fit into 80 bits
   *
   * _Available since v4.7._
   */
  function toUint80(uint256 value) internal pure returns (uint80) {
    require(
      value <= type(uint80).max,
      "SafeCast: value doesn't fit in 80 bits"
    );
    return uint80(value);
  }

  /**
   * @dev Returns the downcasted uint72 from uint256, reverting on
   * overflow (when the input is greater than largest uint72).
   *
   * Counterpart to Solidity's `uint72` operator.
   *
   * Requirements:
   *
   * - input must fit into 72 bits
   *
   * _Available since v4.7._
   */
  function toUint72(uint256 value) internal pure returns (uint72) {
    require(
      value <= type(uint72).max,
      "SafeCast: value doesn't fit in 72 bits"
    );
    return uint72(value);
  }

  /**
   * @dev Returns the downcasted uint64 from uint256, reverting on
   * overflow (when the input is greater than largest uint64).
   *
   * Counterpart to Solidity's `uint64` operator.
   *
   * Requirements:
   *
   * - input must fit into 64 bits
   *
   * _Available since v2.5._
   */
  function toUint64(uint256 value) internal pure returns (uint64) {
    require(
      value <= type(uint64).max,
      "SafeCast: value doesn't fit in 64 bits"
    );
    return uint64(value);
  }

  /**
   * @dev Returns the downcasted uint56 from uint256, reverting on
   * overflow (when the input is greater than largest uint56).
   *
   * Counterpart to Solidity's `uint56` operator.
   *
   * Requirements:
   *
   * - input must fit into 56 bits
   *
   * _Available since v4.7._
   */
  function toUint56(uint256 value) internal pure returns (uint56) {
    require(
      value <= type(uint56).max,
      "SafeCast: value doesn't fit in 56 bits"
    );
    return uint56(value);
  }

  /**
   * @dev Returns the downcasted uint48 from uint256, reverting on
   * overflow (when the input is greater than largest uint48).
   *
   * Counterpart to Solidity's `uint48` operator.
   *
   * Requirements:
   *
   * - input must fit into 48 bits
   *
   * _Available since v4.7._
   */
  function toUint48(uint256 value) internal pure returns (uint48) {
    require(
      value <= type(uint48).max,
      "SafeCast: value doesn't fit in 48 bits"
    );
    return uint48(value);
  }

  /**
   * @dev Returns the downcasted uint40 from uint256, reverting on
   * overflow (when the input is greater than largest uint40).
   *
   * Counterpart to Solidity's `uint40` operator.
   *
   * Requirements:
   *
   * - input must fit into 40 bits
   *
   * _Available since v4.7._
   */
  function toUint40(uint256 value) internal pure returns (uint40) {
    require(
      value <= type(uint40).max,
      "SafeCast: value doesn't fit in 40 bits"
    );
    return uint40(value);
  }

  /**
   * @dev Returns the downcasted uint32 from uint256, reverting on
   * overflow (when the input is greater than largest uint32).
   *
   * Counterpart to Solidity's `uint32` operator.
   *
   * Requirements:
   *
   * - input must fit into 32 bits
   *
   * _Available since v2.5._
   */
  function toUint32(uint256 value) internal pure returns (uint32) {
    require(
      value <= type(uint32).max,
      "SafeCast: value doesn't fit in 32 bits"
    );
    return uint32(value);
  }

  /**
   * @dev Returns the downcasted uint24 from uint256, reverting on
   * overflow (when the input is greater than largest uint24).
   *
   * Counterpart to Solidity's `uint24` operator.
   *
   * Requirements:
   *
   * - input must fit into 24 bits
   *
   * _Available since v4.7._
   */
  function toUint24(uint256 value) internal pure returns (uint24) {
    require(
      value <= type(uint24).max,
      "SafeCast: value doesn't fit in 24 bits"
    );
    return uint24(value);
  }

  /**
   * @dev Returns the downcasted uint16 from uint256, reverting on
   * overflow (when the input is greater than largest uint16).
   *
   * Counterpart to Solidity's `uint16` operator.
   *
   * Requirements:
   *
   * - input must fit into 16 bits
   *
   * _Available since v2.5._
   */
  function toUint16(uint256 value) internal pure returns (uint16) {
    require(
      value <= type(uint16).max,
      "SafeCast: value doesn't fit in 16 bits"
    );
    return uint16(value);
  }

  /**
   * @dev Returns the downcasted uint8 from uint256, reverting on
   * overflow (when the input is greater than largest uint8).
   *
   * Counterpart to Solidity's `uint8` operator.
   *
   * Requirements:
   *
   * - input must fit into 8 bits
   *
   * _Available since v2.5._
   */
  function toUint8(uint256 value) internal pure returns (uint8) {
    require(value <= type(uint8).max, "SafeCast: value doesn't fit in 8 bits");
    return uint8(value);
  }

  /**
   * @dev Converts a signed int256 into an unsigned uint256.
   *
   * Requirements:
   *
   * - input must be greater than or equal to 0.
   *
   * _Available since v3.0._
   */
  function toUint256(int256 value) internal pure returns (uint256) {
    require(value >= 0, "SafeCast: value must be positive");
    return uint256(value);
  }

  /**
   * @dev Returns the downcasted int248 from int256, reverting on
   * overflow (when the input is less than smallest int248 or
   * greater than largest int248).
   *
   * Counterpart to Solidity's `int248` operator.
   *
   * Requirements:
   *
   * - input must fit into 248 bits
   *
   * _Available since v4.7._
   */
  function toInt248(int256 value) internal pure returns (int248 downcasted) {
    downcasted = int248(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 248 bits");
  }

  /**
   * @dev Returns the downcasted int240 from int256, reverting on
   * overflow (when the input is less than smallest int240 or
   * greater than largest int240).
   *
   * Counterpart to Solidity's `int240` operator.
   *
   * Requirements:
   *
   * - input must fit into 240 bits
   *
   * _Available since v4.7._
   */
  function toInt240(int256 value) internal pure returns (int240 downcasted) {
    downcasted = int240(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 240 bits");
  }

  /**
   * @dev Returns the downcasted int232 from int256, reverting on
   * overflow (when the input is less than smallest int232 or
   * greater than largest int232).
   *
   * Counterpart to Solidity's `int232` operator.
   *
   * Requirements:
   *
   * - input must fit into 232 bits
   *
   * _Available since v4.7._
   */
  function toInt232(int256 value) internal pure returns (int232 downcasted) {
    downcasted = int232(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 232 bits");
  }

  /**
   * @dev Returns the downcasted int224 from int256, reverting on
   * overflow (when the input is less than smallest int224 or
   * greater than largest int224).
   *
   * Counterpart to Solidity's `int224` operator.
   *
   * Requirements:
   *
   * - input must fit into 224 bits
   *
   * _Available since v4.7._
   */
  function toInt224(int256 value) internal pure returns (int224 downcasted) {
    downcasted = int224(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 224 bits");
  }

  /**
   * @dev Returns the downcasted int216 from int256, reverting on
   * overflow (when the input is less than smallest int216 or
   * greater than largest int216).
   *
   * Counterpart to Solidity's `int216` operator.
   *
   * Requirements:
   *
   * - input must fit into 216 bits
   *
   * _Available since v4.7._
   */
  function toInt216(int256 value) internal pure returns (int216 downcasted) {
    downcasted = int216(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 216 bits");
  }

  /**
   * @dev Returns the downcasted int208 from int256, reverting on
   * overflow (when the input is less than smallest int208 or
   * greater than largest int208).
   *
   * Counterpart to Solidity's `int208` operator.
   *
   * Requirements:
   *
   * - input must fit into 208 bits
   *
   * _Available since v4.7._
   */
  function toInt208(int256 value) internal pure returns (int208 downcasted) {
    downcasted = int208(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 208 bits");
  }

  /**
   * @dev Returns the downcasted int200 from int256, reverting on
   * overflow (when the input is less than smallest int200 or
   * greater than largest int200).
   *
   * Counterpart to Solidity's `int200` operator.
   *
   * Requirements:
   *
   * - input must fit into 200 bits
   *
   * _Available since v4.7._
   */
  function toInt200(int256 value) internal pure returns (int200 downcasted) {
    downcasted = int200(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 200 bits");
  }

  /**
   * @dev Returns the downcasted int192 from int256, reverting on
   * overflow (when the input is less than smallest int192 or
   * greater than largest int192).
   *
   * Counterpart to Solidity's `int192` operator.
   *
   * Requirements:
   *
   * - input must fit into 192 bits
   *
   * _Available since v4.7._
   */
  function toInt192(int256 value) internal pure returns (int192 downcasted) {
    downcasted = int192(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 192 bits");
  }

  /**
   * @dev Returns the downcasted int184 from int256, reverting on
   * overflow (when the input is less than smallest int184 or
   * greater than largest int184).
   *
   * Counterpart to Solidity's `int184` operator.
   *
   * Requirements:
   *
   * - input must fit into 184 bits
   *
   * _Available since v4.7._
   */
  function toInt184(int256 value) internal pure returns (int184 downcasted) {
    downcasted = int184(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 184 bits");
  }

  /**
   * @dev Returns the downcasted int176 from int256, reverting on
   * overflow (when the input is less than smallest int176 or
   * greater than largest int176).
   *
   * Counterpart to Solidity's `int176` operator.
   *
   * Requirements:
   *
   * - input must fit into 176 bits
   *
   * _Available since v4.7._
   */
  function toInt176(int256 value) internal pure returns (int176 downcasted) {
    downcasted = int176(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 176 bits");
  }

  /**
   * @dev Returns the downcasted int168 from int256, reverting on
   * overflow (when the input is less than smallest int168 or
   * greater than largest int168).
   *
   * Counterpart to Solidity's `int168` operator.
   *
   * Requirements:
   *
   * - input must fit into 168 bits
   *
   * _Available since v4.7._
   */
  function toInt168(int256 value) internal pure returns (int168 downcasted) {
    downcasted = int168(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 168 bits");
  }

  /**
   * @dev Returns the downcasted int160 from int256, reverting on
   * overflow (when the input is less than smallest int160 or
   * greater than largest int160).
   *
   * Counterpart to Solidity's `int160` operator.
   *
   * Requirements:
   *
   * - input must fit into 160 bits
   *
   * _Available since v4.7._
   */
  function toInt160(int256 value) internal pure returns (int160 downcasted) {
    downcasted = int160(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 160 bits");
  }

  /**
   * @dev Returns the downcasted int152 from int256, reverting on
   * overflow (when the input is less than smallest int152 or
   * greater than largest int152).
   *
   * Counterpart to Solidity's `int152` operator.
   *
   * Requirements:
   *
   * - input must fit into 152 bits
   *
   * _Available since v4.7._
   */
  function toInt152(int256 value) internal pure returns (int152 downcasted) {
    downcasted = int152(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 152 bits");
  }

  /**
   * @dev Returns the downcasted int144 from int256, reverting on
   * overflow (when the input is less than smallest int144 or
   * greater than largest int144).
   *
   * Counterpart to Solidity's `int144` operator.
   *
   * Requirements:
   *
   * - input must fit into 144 bits
   *
   * _Available since v4.7._
   */
  function toInt144(int256 value) internal pure returns (int144 downcasted) {
    downcasted = int144(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 144 bits");
  }

  /**
   * @dev Returns the downcasted int136 from int256, reverting on
   * overflow (when the input is less than smallest int136 or
   * greater than largest int136).
   *
   * Counterpart to Solidity's `int136` operator.
   *
   * Requirements:
   *
   * - input must fit into 136 bits
   *
   * _Available since v4.7._
   */
  function toInt136(int256 value) internal pure returns (int136 downcasted) {
    downcasted = int136(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 136 bits");
  }

  /**
   * @dev Returns the downcasted int128 from int256, reverting on
   * overflow (when the input is less than smallest int128 or
   * greater than largest int128).
   *
   * Counterpart to Solidity's `int128` operator.
   *
   * Requirements:
   *
   * - input must fit into 128 bits
   *
   * _Available since v3.1._
   */
  function toInt128(int256 value) internal pure returns (int128 downcasted) {
    downcasted = int128(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 128 bits");
  }

  /**
   * @dev Returns the downcasted int120 from int256, reverting on
   * overflow (when the input is less than smallest int120 or
   * greater than largest int120).
   *
   * Counterpart to Solidity's `int120` operator.
   *
   * Requirements:
   *
   * - input must fit into 120 bits
   *
   * _Available since v4.7._
   */
  function toInt120(int256 value) internal pure returns (int120 downcasted) {
    downcasted = int120(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 120 bits");
  }

  /**
   * @dev Returns the downcasted int112 from int256, reverting on
   * overflow (when the input is less than smallest int112 or
   * greater than largest int112).
   *
   * Counterpart to Solidity's `int112` operator.
   *
   * Requirements:
   *
   * - input must fit into 112 bits
   *
   * _Available since v4.7._
   */
  function toInt112(int256 value) internal pure returns (int112 downcasted) {
    downcasted = int112(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 112 bits");
  }

  /**
   * @dev Returns the downcasted int104 from int256, reverting on
   * overflow (when the input is less than smallest int104 or
   * greater than largest int104).
   *
   * Counterpart to Solidity's `int104` operator.
   *
   * Requirements:
   *
   * - input must fit into 104 bits
   *
   * _Available since v4.7._
   */
  function toInt104(int256 value) internal pure returns (int104 downcasted) {
    downcasted = int104(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 104 bits");
  }

  /**
   * @dev Returns the downcasted int96 from int256, reverting on
   * overflow (when the input is less than smallest int96 or
   * greater than largest int96).
   *
   * Counterpart to Solidity's `int96` operator.
   *
   * Requirements:
   *
   * - input must fit into 96 bits
   *
   * _Available since v4.7._
   */
  function toInt96(int256 value) internal pure returns (int96 downcasted) {
    downcasted = int96(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 96 bits");
  }

  /**
   * @dev Returns the downcasted int88 from int256, reverting on
   * overflow (when the input is less than smallest int88 or
   * greater than largest int88).
   *
   * Counterpart to Solidity's `int88` operator.
   *
   * Requirements:
   *
   * - input must fit into 88 bits
   *
   * _Available since v4.7._
   */
  function toInt88(int256 value) internal pure returns (int88 downcasted) {
    downcasted = int88(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 88 bits");
  }

  /**
   * @dev Returns the downcasted int80 from int256, reverting on
   * overflow (when the input is less than smallest int80 or
   * greater than largest int80).
   *
   * Counterpart to Solidity's `int80` operator.
   *
   * Requirements:
   *
   * - input must fit into 80 bits
   *
   * _Available since v4.7._
   */
  function toInt80(int256 value) internal pure returns (int80 downcasted) {
    downcasted = int80(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 80 bits");
  }

  /**
   * @dev Returns the downcasted int72 from int256, reverting on
   * overflow (when the input is less than smallest int72 or
   * greater than largest int72).
   *
   * Counterpart to Solidity's `int72` operator.
   *
   * Requirements:
   *
   * - input must fit into 72 bits
   *
   * _Available since v4.7._
   */
  function toInt72(int256 value) internal pure returns (int72 downcasted) {
    downcasted = int72(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 72 bits");
  }

  /**
   * @dev Returns the downcasted int64 from int256, reverting on
   * overflow (when the input is less than smallest int64 or
   * greater than largest int64).
   *
   * Counterpart to Solidity's `int64` operator.
   *
   * Requirements:
   *
   * - input must fit into 64 bits
   *
   * _Available since v3.1._
   */
  function toInt64(int256 value) internal pure returns (int64 downcasted) {
    downcasted = int64(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 64 bits");
  }

  /**
   * @dev Returns the downcasted int56 from int256, reverting on
   * overflow (when the input is less than smallest int56 or
   * greater than largest int56).
   *
   * Counterpart to Solidity's `int56` operator.
   *
   * Requirements:
   *
   * - input must fit into 56 bits
   *
   * _Available since v4.7._
   */
  function toInt56(int256 value) internal pure returns (int56 downcasted) {
    downcasted = int56(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 56 bits");
  }

  /**
   * @dev Returns the downcasted int48 from int256, reverting on
   * overflow (when the input is less than smallest int48 or
   * greater than largest int48).
   *
   * Counterpart to Solidity's `int48` operator.
   *
   * Requirements:
   *
   * - input must fit into 48 bits
   *
   * _Available since v4.7._
   */
  function toInt48(int256 value) internal pure returns (int48 downcasted) {
    downcasted = int48(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 48 bits");
  }

  /**
   * @dev Returns the downcasted int40 from int256, reverting on
   * overflow (when the input is less than smallest int40 or
   * greater than largest int40).
   *
   * Counterpart to Solidity's `int40` operator.
   *
   * Requirements:
   *
   * - input must fit into 40 bits
   *
   * _Available since v4.7._
   */
  function toInt40(int256 value) internal pure returns (int40 downcasted) {
    downcasted = int40(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 40 bits");
  }

  /**
   * @dev Returns the downcasted int32 from int256, reverting on
   * overflow (when the input is less than smallest int32 or
   * greater than largest int32).
   *
   * Counterpart to Solidity's `int32` operator.
   *
   * Requirements:
   *
   * - input must fit into 32 bits
   *
   * _Available since v3.1._
   */
  function toInt32(int256 value) internal pure returns (int32 downcasted) {
    downcasted = int32(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 32 bits");
  }

  /**
   * @dev Returns the downcasted int24 from int256, reverting on
   * overflow (when the input is less than smallest int24 or
   * greater than largest int24).
   *
   * Counterpart to Solidity's `int24` operator.
   *
   * Requirements:
   *
   * - input must fit into 24 bits
   *
   * _Available since v4.7._
   */
  function toInt24(int256 value) internal pure returns (int24 downcasted) {
    downcasted = int24(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 24 bits");
  }

  /**
   * @dev Returns the downcasted int16 from int256, reverting on
   * overflow (when the input is less than smallest int16 or
   * greater than largest int16).
   *
   * Counterpart to Solidity's `int16` operator.
   *
   * Requirements:
   *
   * - input must fit into 16 bits
   *
   * _Available since v3.1._
   */
  function toInt16(int256 value) internal pure returns (int16 downcasted) {
    downcasted = int16(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 16 bits");
  }

  /**
   * @dev Returns the downcasted int8 from int256, reverting on
   * overflow (when the input is less than smallest int8 or
   * greater than largest int8).
   *
   * Counterpart to Solidity's `int8` operator.
   *
   * Requirements:
   *
   * - input must fit into 8 bits
   *
   * _Available since v3.1._
   */
  function toInt8(int256 value) internal pure returns (int8 downcasted) {
    downcasted = int8(value);
    require(downcasted == value, "SafeCast: value doesn't fit in 8 bits");
  }

  /**
   * @dev Converts an unsigned uint256 into a signed int256.
   *
   * Requirements:
   *
   * - input must be less than or equal to maxInt256.
   *
   * _Available since v3.0._
   */
  function toInt256(uint256 value) internal pure returns (int256) {
    // Note: Unsafe cast below is okay because `type(int256).max` is guaranteed to be positive
    require(
      value <= uint256(type(int256).max),
      "SafeCast: value doesn't fit in an int256"
    );
    return int256(value);
  }
}

// File @openzeppelin/contracts-upgradeable/utils/structs/DoubleEndedQueueUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/structs/DoubleEndedQueue.sol)
pragma solidity ^0.8.4;

/**
 * @dev A sequence of items with the ability to efficiently push and pop items (i.e. insert and remove) on both ends of
 * the sequence (called front and back). Among other access patterns, it can be used to implement efficient LIFO and
 * FIFO queues. Storage use is optimized, and all operations are O(1) constant time. This includes {clear}, given that
 * the existing queue contents are left in storage.
 *
 * The struct is called `Bytes32Deque`. Other types can be cast to and from `bytes32`. This data structure can only be
 * used in storage, and not in memory.
 * ```solidity
 * DoubleEndedQueue.Bytes32Deque queue;
 * ```
 *
 * _Available since v4.6._
 */
library DoubleEndedQueueUpgradeable {
  /**
   * @dev An operation (e.g. {front}) couldn't be completed due to the queue being empty.
   */
  error Empty();

  /**
   * @dev An operation (e.g. {at}) couldn't be completed due to an index being out of bounds.
   */
  error OutOfBounds();

  /**
   * @dev Indices are signed integers because the queue can grow in any direction. They are 128 bits so begin and end
   * are packed in a single storage slot for efficient access. Since the items are added one at a time we can safely
   * assume that these 128-bit indices will not overflow, and use unchecked arithmetic.
   *
   * Struct members have an underscore prefix indicating that they are "private" and should not be read or written to
   * directly. Use the functions provided below instead. Modifying the struct manually may violate assumptions and
   * lead to unexpected behavior.
   *
   * Indices are in the range [begin, end) which means the first item is at data[begin] and the last item is at
   * data[end - 1].
   */
  struct Bytes32Deque {
    int128 _begin;
    int128 _end;
    mapping(int128 => bytes32) _data;
  }

  /**
   * @dev Inserts an item at the end of the queue.
   */
  function pushBack(Bytes32Deque storage deque, bytes32 value) internal {
    int128 backIndex = deque._end;
    deque._data[backIndex] = value;
    unchecked {
      deque._end = backIndex + 1;
    }
  }

  /**
   * @dev Removes the item at the end of the queue and returns it.
   *
   * Reverts with `Empty` if the queue is empty.
   */
  function popBack(
    Bytes32Deque storage deque
  ) internal returns (bytes32 value) {
    if (empty(deque)) revert Empty();
    int128 backIndex;
    unchecked {
      backIndex = deque._end - 1;
    }
    value = deque._data[backIndex];
    delete deque._data[backIndex];
    deque._end = backIndex;
  }

  /**
   * @dev Inserts an item at the beginning of the queue.
   */
  function pushFront(Bytes32Deque storage deque, bytes32 value) internal {
    int128 frontIndex;
    unchecked {
      frontIndex = deque._begin - 1;
    }
    deque._data[frontIndex] = value;
    deque._begin = frontIndex;
  }

  /**
   * @dev Removes the item at the beginning of the queue and returns it.
   *
   * Reverts with `Empty` if the queue is empty.
   */
  function popFront(
    Bytes32Deque storage deque
  ) internal returns (bytes32 value) {
    if (empty(deque)) revert Empty();
    int128 frontIndex = deque._begin;
    value = deque._data[frontIndex];
    delete deque._data[frontIndex];
    unchecked {
      deque._begin = frontIndex + 1;
    }
  }

  /**
   * @dev Returns the item at the beginning of the queue.
   *
   * Reverts with `Empty` if the queue is empty.
   */
  function front(
    Bytes32Deque storage deque
  ) internal view returns (bytes32 value) {
    if (empty(deque)) revert Empty();
    int128 frontIndex = deque._begin;
    return deque._data[frontIndex];
  }

  /**
   * @dev Returns the item at the end of the queue.
   *
   * Reverts with `Empty` if the queue is empty.
   */
  function back(
    Bytes32Deque storage deque
  ) internal view returns (bytes32 value) {
    if (empty(deque)) revert Empty();
    int128 backIndex;
    unchecked {
      backIndex = deque._end - 1;
    }
    return deque._data[backIndex];
  }

  /**
   * @dev Return the item at a position in the queue given by `index`, with the first item at 0 and last item at
   * `length(deque) - 1`.
   *
   * Reverts with `OutOfBounds` if the index is out of bounds.
   */
  function at(
    Bytes32Deque storage deque,
    uint256 index
  ) internal view returns (bytes32 value) {
    // int256(deque._begin) is a safe upcast
    int128 idx = SafeCastUpgradeable.toInt128(
      int256(deque._begin) + SafeCastUpgradeable.toInt256(index)
    );
    if (idx >= deque._end) revert OutOfBounds();
    return deque._data[idx];
  }

  /**
   * @dev Resets the queue back to being empty.
   *
   * NOTE: The current items are left behind in storage. This does not affect the functioning of the queue, but misses
   * out on potential gas refunds.
   */
  function clear(Bytes32Deque storage deque) internal {
    deque._begin = 0;
    deque._end = 0;
  }

  /**
   * @dev Returns the number of items in the queue.
   */
  function length(Bytes32Deque storage deque) internal view returns (uint256) {
    // The interface preserves the invariant that begin <= end so we assume this will not overflow.
    // We also assume there are at most int256.max items in the queue.
    unchecked {
      return uint256(int256(deque._end) - int256(deque._begin));
    }
  }

  /**
   * @dev Returns true if the queue is empty.
   */
  function empty(Bytes32Deque storage deque) internal view returns (bool) {
    return deque._end <= deque._begin;
  }
}

// File @openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.1) (governance/Governor.sol)

pragma solidity ^0.8.0;

/**
 * @dev Core of the governance system, designed to be extended though various modules.
 *
 * This contract is abstract and requires several functions to be implemented in various modules:
 *
 * - A counting module must implement {quorum}, {_quorumReached}, {_voteSucceeded} and {_countVote}
 * - A voting module must implement {_getVotes}
 * - Additionally, {votingPeriod} must also be implemented
 *
 * _Available since v4.3._
 */
abstract contract GovernorUpgradeable is
  Initializable,
  ContextUpgradeable,
  ERC165Upgradeable,
  EIP712Upgradeable,
  IGovernorUpgradeable,
  IERC721ReceiverUpgradeable,
  IERC1155ReceiverUpgradeable
{
  using DoubleEndedQueueUpgradeable for DoubleEndedQueueUpgradeable.Bytes32Deque;

  bytes32 public constant BALLOT_TYPEHASH =
    keccak256("Ballot(uint256 proposalId,uint8 support)");
  bytes32 public constant EXTENDED_BALLOT_TYPEHASH =
    keccak256(
      "ExtendedBallot(uint256 proposalId,uint8 support,string reason,bytes params)"
    );

  // solhint-disable var-name-mixedcase
  struct ProposalCore {
    // --- start retyped from Timers.BlockNumber at offset 0x00 ---
    uint64 voteStart;
    address proposer;
    bytes4 __gap_unused0;
    // --- start retyped from Timers.BlockNumber at offset 0x20 ---
    uint64 voteEnd;
    bytes24 __gap_unused1;
    // --- Remaining fields starting at offset 0x40 ---------------
    bool executed;
    bool canceled;
  }
  // solhint-enable var-name-mixedcase

  string private _name;

  /// @custom:oz-retyped-from mapping(uint256 => Governor.ProposalCore)
  mapping(uint256 => ProposalCore) private _proposals;

  // This queue keeps track of the governor operating on itself. Calls to functions protected by the
  // {onlyGovernance} modifier needs to be whitelisted in this queue. Whitelisting is set in {_beforeExecute},
  // consumed by the {onlyGovernance} modifier and eventually reset in {_afterExecute}. This ensures that the
  // execution of {onlyGovernance} protected calls can only be achieved through successful proposals.
  DoubleEndedQueueUpgradeable.Bytes32Deque private _governanceCall;

  /**
   * @dev Restricts a function so it can only be executed through governance proposals. For example, governance
   * parameter setters in {GovernorSettings} are protected using this modifier.
   *
   * The governance executing address may be different from the Governor's own address, for example it could be a
   * timelock. This can be customized by modules by overriding {_executor}. The executor is only able to invoke these
   * functions during the execution of the governor's {execute} function, and not under any other circumstances. Thus,
   * for example, additional timelock proposers are not able to change governance parameters without going through the
   * governance protocol (since v4.6).
   */
  modifier onlyGovernance() {
    require(_msgSender() == _executor(), "Governor: onlyGovernance");
    if (_executor() != address(this)) {
      bytes32 msgDataHash = keccak256(_msgData());
      // loop until popping the expected operation - throw if deque is empty (operation not authorized)
      while (_governanceCall.popFront() != msgDataHash) {}
    }
    _;
  }

  /**
   * @dev Sets the value for {name} and {version}
   */
  function __Governor_init(string memory name_) internal onlyInitializing {
    __EIP712_init_unchained(name_, version());
    __Governor_init_unchained(name_);
  }

  function __Governor_init_unchained(
    string memory name_
  ) internal onlyInitializing {
    _name = name_;
  }

  /**
   * @dev Function to receive ETH that will be handled by the governor (disabled if executor is a third party contract)
   */
  receive() external payable virtual {
    require(_executor() == address(this), "Governor: must send to executor");
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(IERC165Upgradeable, ERC165Upgradeable)
    returns (bool)
  {
    bytes4 governorCancelId = this.cancel.selector ^
      this.proposalProposer.selector;

    bytes4 governorParamsId = this.castVoteWithReasonAndParams.selector ^
      this.castVoteWithReasonAndParamsBySig.selector ^
      this.getVotesWithParams.selector;

    // The original interface id in v4.3.
    bytes4 governor43Id = type(IGovernorUpgradeable).interfaceId ^
      type(IERC6372Upgradeable).interfaceId ^
      governorCancelId ^
      governorParamsId;

    // An updated interface id in v4.6, with params added.
    bytes4 governor46Id = type(IGovernorUpgradeable).interfaceId ^
      type(IERC6372Upgradeable).interfaceId ^
      governorCancelId;

    // For the updated interface id in v4.9, we use governorCancelId directly.

    return
      interfaceId == governor43Id ||
      interfaceId == governor46Id ||
      interfaceId == governorCancelId ||
      interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @dev See {IGovernor-name}.
   */
  function name() public view virtual override returns (string memory) {
    return _name;
  }

  /**
   * @dev See {IGovernor-version}.
   */
  function version() public view virtual override returns (string memory) {
    return "1";
  }

  /**
   * @dev See {IGovernor-hashProposal}.
   *
   * The proposal id is produced by hashing the ABI encoded `targets` array, the `values` array, the `calldatas` array
   * and the descriptionHash (bytes32 which itself is the keccak256 hash of the description string). This proposal id
   * can be produced from the proposal data which is part of the {ProposalCreated} event. It can even be computed in
   * advance, before the proposal is submitted.
   *
   * Note that the chainId and the governor address are not part of the proposal id computation. Consequently, the
   * same proposal (with same operation and same description) will have the same id if submitted on multiple governors
   * across multiple networks. This also means that in order to execute the same operation twice (on the same
   * governor) the proposer will have to change the description in order to avoid proposal id conflicts.
   */
  function hashProposal(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public pure virtual override returns (uint256) {
    return
      uint256(
        keccak256(abi.encode(targets, values, calldatas, descriptionHash))
      );
  }

  /**
   * @dev See {IGovernor-state}.
   */
  function state(
    uint256 proposalId
  ) public view virtual override returns (ProposalState) {
    ProposalCore storage proposal = _proposals[proposalId];

    if (proposal.executed) {
      return ProposalState.Executed;
    }

    if (proposal.canceled) {
      return ProposalState.Canceled;
    }

    uint256 snapshot = proposalSnapshot(proposalId);

    if (snapshot == 0) {
      revert("Governor: unknown proposal id");
    }

    uint256 currentTimepoint = clock();

    if (snapshot >= currentTimepoint) {
      return ProposalState.Pending;
    }

    uint256 deadline = proposalDeadline(proposalId);

    if (deadline >= currentTimepoint) {
      return ProposalState.Active;
    }

    if (_quorumReached(proposalId) && _voteSucceeded(proposalId)) {
      return ProposalState.Succeeded;
    } else {
      return ProposalState.Defeated;
    }
  }

  /**
   * @dev Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_.
   */
  function proposalThreshold() public view virtual returns (uint256) {
    return 0;
  }

  /**
   * @dev See {IGovernor-proposalSnapshot}.
   */
  function proposalSnapshot(
    uint256 proposalId
  ) public view virtual override returns (uint256) {
    return _proposals[proposalId].voteStart;
  }

  /**
   * @dev See {IGovernor-proposalDeadline}.
   */
  function proposalDeadline(
    uint256 proposalId
  ) public view virtual override returns (uint256) {
    return _proposals[proposalId].voteEnd;
  }

  /**
   * @dev Returns the account that created a given proposal.
   */
  function proposalProposer(
    uint256 proposalId
  ) public view virtual override returns (address) {
    return _proposals[proposalId].proposer;
  }

  /**
   * @dev Amount of votes already cast passes the threshold limit.
   */
  function _quorumReached(
    uint256 proposalId
  ) internal view virtual returns (bool);

  /**
   * @dev Is the proposal successful or not.
   */
  function _voteSucceeded(
    uint256 proposalId
  ) internal view virtual returns (bool);

  /**
   * @dev Get the voting weight of `account` at a specific `timepoint`, for a vote as described by `params`.
   */
  function _getVotes(
    address account,
    uint256 timepoint,
    bytes memory params
  ) internal view virtual returns (uint256);

  /**
   * @dev Register a vote for `proposalId` by `account` with a given `support`, voting `weight` and voting `params`.
   *
   * Note: Support is generic and can represent various things depending on the voting system used.
   */
  function _countVote(
    uint256 proposalId,
    address account,
    uint8 support,
    uint256 weight,
    bytes memory params
  ) internal virtual;

  /**
   * @dev Default additional encoded parameters used by castVote methods that don't include them
   *
   * Note: Should be overridden by specific implementations to use an appropriate value, the
   * meaning of the additional params, in the context of that implementation
   */
  function _defaultParams() internal view virtual returns (bytes memory) {
    return "";
  }

  /**
   * @dev See {IGovernor-propose}. This function has opt-in frontrunning protection, described in {_isValidDescriptionForProposer}.
   */
  function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
  ) public virtual override returns (uint256) {
    address proposer = _msgSender();
    require(
      _isValidDescriptionForProposer(proposer, description),
      "Governor: proposer restricted"
    );

    uint256 currentTimepoint = clock();
    require(
      getVotes(proposer, currentTimepoint - 1) >= proposalThreshold(),
      "Governor: proposer votes below proposal threshold"
    );

    uint256 proposalId = hashProposal(
      targets,
      values,
      calldatas,
      keccak256(bytes(description))
    );

    require(
      targets.length == values.length,
      "Governor: invalid proposal length"
    );
    require(
      targets.length == calldatas.length,
      "Governor: invalid proposal length"
    );
    require(targets.length > 0, "Governor: empty proposal");
    require(
      _proposals[proposalId].voteStart == 0,
      "Governor: proposal already exists"
    );

    uint256 snapshot = currentTimepoint + votingDelay();
    uint256 deadline = snapshot + votingPeriod();

    _proposals[proposalId] = ProposalCore({
      proposer: proposer,
      voteStart: SafeCastUpgradeable.toUint64(snapshot),
      voteEnd: SafeCastUpgradeable.toUint64(deadline),
      executed: false,
      canceled: false,
      __gap_unused0: 0,
      __gap_unused1: 0
    });

    emit ProposalCreated(
      proposalId,
      proposer,
      targets,
      values,
      new string[](targets.length),
      calldatas,
      snapshot,
      deadline,
      description
    );

    return proposalId;
  }

  /**
   * @dev See {IGovernor-execute}.
   */
  function execute(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public payable virtual override returns (uint256) {
    uint256 proposalId = hashProposal(
      targets,
      values,
      calldatas,
      descriptionHash
    );

    ProposalState currentState = state(proposalId);
    require(
      currentState == ProposalState.Succeeded ||
        currentState == ProposalState.Queued,
      "Governor: proposal not successful"
    );
    _proposals[proposalId].executed = true;

    emit ProposalExecuted(proposalId);

    _beforeExecute(proposalId, targets, values, calldatas, descriptionHash);
    _execute(proposalId, targets, values, calldatas, descriptionHash);
    _afterExecute(proposalId, targets, values, calldatas, descriptionHash);

    return proposalId;
  }

  /**
   * @dev See {IGovernor-cancel}.
   */
  function cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public virtual override returns (uint256) {
    uint256 proposalId = hashProposal(
      targets,
      values,
      calldatas,
      descriptionHash
    );
    require(
      state(proposalId) == ProposalState.Pending,
      "Governor: too late to cancel"
    );
    require(
      _msgSender() == _proposals[proposalId].proposer,
      "Governor: only proposer can cancel"
    );
    return _cancel(targets, values, calldatas, descriptionHash);
  }

  /**
   * @dev Internal execution mechanism. Can be overridden to implement different execution mechanism
   */
  function _execute(
    uint256 /* proposalId */,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 /*descriptionHash*/
  ) internal virtual {
    string memory errorMessage = "Governor: call reverted without message";
    for (uint256 i = 0; i < targets.length; ++i) {
      (bool success, bytes memory returndata) = targets[i].call{
        value: values[i]
      }(calldatas[i]);
      AddressUpgradeable.verifyCallResult(success, returndata, errorMessage);
    }
  }

  /**
   * @dev Hook before execution is triggered.
   */
  function _beforeExecute(
    uint256 /* proposalId */,
    address[] memory targets,
    uint256[] memory /* values */,
    bytes[] memory calldatas,
    bytes32 /*descriptionHash*/
  ) internal virtual {
    if (_executor() != address(this)) {
      for (uint256 i = 0; i < targets.length; ++i) {
        if (targets[i] == address(this)) {
          _governanceCall.pushBack(keccak256(calldatas[i]));
        }
      }
    }
  }

  /**
   * @dev Hook after execution is triggered.
   */
  function _afterExecute(
    uint256 /* proposalId */,
    address[] memory /* targets */,
    uint256[] memory /* values */,
    bytes[] memory /* calldatas */,
    bytes32 /*descriptionHash*/
  ) internal virtual {
    if (_executor() != address(this)) {
      if (!_governanceCall.empty()) {
        _governanceCall.clear();
      }
    }
  }

  /**
   * @dev Internal cancel mechanism: locks up the proposal timer, preventing it from being re-submitted. Marks it as
   * canceled to allow distinguishing it from executed proposals.
   *
   * Emits a {IGovernor-ProposalCanceled} event.
   */
  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal virtual returns (uint256) {
    uint256 proposalId = hashProposal(
      targets,
      values,
      calldatas,
      descriptionHash
    );

    ProposalState currentState = state(proposalId);

    require(
      currentState != ProposalState.Canceled &&
        currentState != ProposalState.Expired &&
        currentState != ProposalState.Executed,
      "Governor: proposal not active"
    );
    _proposals[proposalId].canceled = true;

    emit ProposalCanceled(proposalId);

    return proposalId;
  }

  /**
   * @dev See {IGovernor-getVotes}.
   */
  function getVotes(
    address account,
    uint256 timepoint
  ) public view virtual override returns (uint256) {
    return _getVotes(account, timepoint, _defaultParams());
  }

  /**
   * @dev See {IGovernor-getVotesWithParams}.
   */
  function getVotesWithParams(
    address account,
    uint256 timepoint,
    bytes memory params
  ) public view virtual override returns (uint256) {
    return _getVotes(account, timepoint, params);
  }

  /**
   * @dev See {IGovernor-castVote}.
   */
  function castVote(
    uint256 proposalId,
    uint8 support
  ) public virtual override returns (uint256) {
    address voter = _msgSender();
    return _castVote(proposalId, voter, support, "");
  }

  /**
   * @dev See {IGovernor-castVoteWithReason}.
   */
  function castVoteWithReason(
    uint256 proposalId,
    uint8 support,
    string calldata reason
  ) public virtual override returns (uint256) {
    address voter = _msgSender();
    return _castVote(proposalId, voter, support, reason);
  }

  /**
   * @dev See {IGovernor-castVoteWithReasonAndParams}.
   */
  function castVoteWithReasonAndParams(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    bytes memory params
  ) public virtual override returns (uint256) {
    address voter = _msgSender();
    return _castVote(proposalId, voter, support, reason, params);
  }

  /**
   * @dev See {IGovernor-castVoteBySig}.
   */
  function castVoteBySig(
    uint256 proposalId,
    uint8 support,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public virtual override returns (uint256) {
    address voter = ECDSAUpgradeable.recover(
      _hashTypedDataV4(
        keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support))
      ),
      v,
      r,
      s
    );
    return _castVote(proposalId, voter, support, "");
  }

  /**
   * @dev See {IGovernor-castVoteWithReasonAndParamsBySig}.
   */
  function castVoteWithReasonAndParamsBySig(
    uint256 proposalId,
    uint8 support,
    string calldata reason,
    bytes memory params,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public virtual override returns (uint256) {
    address voter = ECDSAUpgradeable.recover(
      _hashTypedDataV4(
        keccak256(
          abi.encode(
            EXTENDED_BALLOT_TYPEHASH,
            proposalId,
            support,
            keccak256(bytes(reason)),
            keccak256(params)
          )
        )
      ),
      v,
      r,
      s
    );

    return _castVote(proposalId, voter, support, reason, params);
  }

  /**
   * @dev Internal vote casting mechanism: Check that the vote is pending, that it has not been cast yet, retrieve
   * voting weight using {IGovernor-getVotes} and call the {_countVote} internal function. Uses the _defaultParams().
   *
   * Emits a {IGovernor-VoteCast} event.
   */
  function _castVote(
    uint256 proposalId,
    address account,
    uint8 support,
    string memory reason
  ) internal virtual returns (uint256) {
    return _castVote(proposalId, account, support, reason, _defaultParams());
  }

  /**
   * @dev Internal vote casting mechanism: Check that the vote is pending, that it has not been cast yet, retrieve
   * voting weight using {IGovernor-getVotes} and call the {_countVote} internal function.
   *
   * Emits a {IGovernor-VoteCast} event.
   */
  function _castVote(
    uint256 proposalId,
    address account,
    uint8 support,
    string memory reason,
    bytes memory params
  ) internal virtual returns (uint256) {
    ProposalCore storage proposal = _proposals[proposalId];
    require(
      state(proposalId) == ProposalState.Active,
      "Governor: vote not currently active"
    );

    uint256 weight = _getVotes(account, proposal.voteStart, params);
    _countVote(proposalId, account, support, weight, params);

    if (params.length == 0) {
      emit VoteCast(account, proposalId, support, weight, reason);
    } else {
      emit VoteCastWithParams(
        account,
        proposalId,
        support,
        weight,
        reason,
        params
      );
    }

    return weight;
  }

  /**
   * @dev Relays a transaction or function call to an arbitrary target. In cases where the governance executor
   * is some contract other than the governor itself, like when using a timelock, this function can be invoked
   * in a governance proposal to recover tokens or Ether that was sent to the governor contract by mistake.
   * Note that if the executor is simply the governor itself, use of `relay` is redundant.
   */
  function relay(
    address target,
    uint256 value,
    bytes calldata data
  ) external payable virtual onlyGovernance {
    (bool success, bytes memory returndata) = target.call{value: value}(data);
    AddressUpgradeable.verifyCallResult(
      success,
      returndata,
      "Governor: relay reverted without message"
    );
  }

  /**
   * @dev Address through which the governor executes action. Will be overloaded by module that execute actions
   * through another contract such as a timelock.
   */
  function _executor() internal view virtual returns (address) {
    return address(this);
  }

  /**
   * @dev See {IERC721Receiver-onERC721Received}.
   */
  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC721Received.selector;
  }

  /**
   * @dev See {IERC1155Receiver-onERC1155Received}.
   */
  function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  /**
   * @dev See {IERC1155Receiver-onERC1155BatchReceived}.
   */
  function onERC1155BatchReceived(
    address,
    address,
    uint256[] memory,
    uint256[] memory,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }

  /**
   * @dev Check if the proposer is authorized to submit a proposal with the given description.
   *
   * If the proposal description ends with `#proposer=0x???`, where `0x???` is an address written as a hex string
   * (case insensitive), then the submission of this proposal will only be authorized to said address.
   *
   * This is used for frontrunning protection. By adding this pattern at the end of their proposal, one can ensure
   * that no other address can submit the same proposal. An attacker would have to either remove or change that part,
   * which would result in a different proposal id.
   *
   * If the description does not match this pattern, it is unrestricted and anyone can submit it. This includes:
   * - If the `0x???` part is not a valid hex string.
   * - If the `0x???` part is a valid hex string, but does not contain exactly 40 hex digits.
   * - If it ends with the expected suffix followed by newlines or other whitespace.
   * - If it ends with some other similar suffix, e.g. `#other=abc`.
   * - If it does not end with any such suffix.
   */
  function _isValidDescriptionForProposer(
    address proposer,
    string memory description
  ) internal view virtual returns (bool) {
    uint256 len = bytes(description).length;

    // Length is too short to contain a valid proposer suffix
    if (len < 52) {
      return true;
    }

    // Extract what would be the `#proposer=0x` marker beginning the suffix
    bytes12 marker;
    assembly {
      // - Start of the string contents in memory = description + 32
      // - First character of the marker = len - 52
      //   - Length of "#proposer=0x0000000000000000000000000000000000000000" = 52
      // - We read the memory word starting at the first character of the marker:
      //   - (description + 32) + (len - 52) = description + (len - 20)
      // - Note: Solidity will ignore anything past the first 12 bytes
      marker := mload(add(description, sub(len, 20)))
    }

    // If the marker is not found, there is no proposer suffix to check
    if (marker != bytes12("#proposer=0x")) {
      return true;
    }

    // Parse the 40 characters following the marker as uint160
    uint160 recovered = 0;
    for (uint256 i = len - 40; i < len; ++i) {
      (bool isHex, uint8 value) = _tryHexToUint(bytes(description)[i]);
      // If any of the characters is not a hex digit, ignore the suffix entirely
      if (!isHex) {
        return true;
      }
      recovered = (recovered << 4) | value;
    }

    return recovered == uint160(proposer);
  }

  /**
   * @dev Try to parse a character from a string as a hex value. Returns `(true, value)` if the char is in
   * `[0-9a-fA-F]` and `(false, 0)` otherwise. Value is guaranteed to be in the range `0 <= value < 16`
   */
  function _tryHexToUint(bytes1 char) private pure returns (bool, uint8) {
    uint8 c = uint8(char);
    unchecked {
      // Case 0-9
      if (47 < c && c < 58) {
        return (true, c - 48);
      }
      // Case A-F
      else if (64 < c && c < 71) {
        return (true, c - 55);
      }
      // Case a-f
      else if (96 < c && c < 103) {
        return (true, c - 87);
      }
      // Else: not a hex char
      else {
        return (false, 0);
      }
    }
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[46] private __gap;
}

// File @openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/extensions/GovernorCountingSimple.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of {Governor} for simple, 3 options, vote counting.
 *
 * _Available since v4.3._
 */
abstract contract GovernorCountingSimpleUpgradeable is
  Initializable,
  GovernorUpgradeable
{
  function __GovernorCountingSimple_init() internal onlyInitializing {}

  function __GovernorCountingSimple_init_unchained()
    internal
    onlyInitializing
  {}

  /**
   * @dev Supported vote types. Matches Governor Bravo ordering.
   */
  enum VoteType {
    Against,
    For,
    Abstain
  }

  struct ProposalVote {
    uint256 againstVotes;
    uint256 forVotes;
    uint256 abstainVotes;
    mapping(address => bool) hasVoted;
  }

  mapping(uint256 => ProposalVote) private _proposalVotes;

  /**
   * @dev See {IGovernor-COUNTING_MODE}.
   */
  // solhint-disable-next-line func-name-mixedcase
  function COUNTING_MODE()
    public
    pure
    virtual
    override
    returns (string memory)
  {
    return "support=bravo&quorum=for,abstain";
  }

  /**
   * @dev See {IGovernor-hasVoted}.
   */
  function hasVoted(
    uint256 proposalId,
    address account
  ) public view virtual override returns (bool) {
    return _proposalVotes[proposalId].hasVoted[account];
  }

  /**
   * @dev Accessor to the internal vote counts.
   */
  function proposalVotes(
    uint256 proposalId
  )
    public
    view
    virtual
    returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)
  {
    ProposalVote storage proposalVote = _proposalVotes[proposalId];
    return (
      proposalVote.againstVotes,
      proposalVote.forVotes,
      proposalVote.abstainVotes
    );
  }

  /**
   * @dev See {Governor-_quorumReached}.
   */
  function _quorumReached(
    uint256 proposalId
  ) internal view virtual override returns (bool) {
    ProposalVote storage proposalVote = _proposalVotes[proposalId];

    return
      quorum(proposalSnapshot(proposalId)) <=
      proposalVote.forVotes + proposalVote.abstainVotes;
  }

  /**
   * @dev See {Governor-_voteSucceeded}. In this module, the forVotes must be strictly over the againstVotes.
   */
  function _voteSucceeded(
    uint256 proposalId
  ) internal view virtual override returns (bool) {
    ProposalVote storage proposalVote = _proposalVotes[proposalId];

    return proposalVote.forVotes > proposalVote.againstVotes;
  }

  /**
   * @dev See {Governor-_countVote}. In this module, the support follows the `VoteType` enum (from Governor Bravo).
   */
  function _countVote(
    uint256 proposalId,
    address account,
    uint8 support,
    uint256 weight,
    bytes memory // params
  ) internal virtual override {
    ProposalVote storage proposalVote = _proposalVotes[proposalId];

    require(
      !proposalVote.hasVoted[account],
      "GovernorVotingSimple: vote already cast"
    );
    proposalVote.hasVoted[account] = true;

    if (support == uint8(VoteType.Against)) {
      proposalVote.againstVotes += weight;
    } else if (support == uint8(VoteType.For)) {
      proposalVote.forVotes += weight;
    } else if (support == uint8(VoteType.Abstain)) {
      proposalVote.abstainVotes += weight;
    } else {
      revert("GovernorVotingSimple: invalid value for enum VoteType");
    }
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[49] private __gap;
}

// File @openzeppelin/contracts-upgradeable/governance/extensions/IGovernorTimelockUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (governance/extensions/IGovernorTimelock.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of the {IGovernor} for timelock supporting modules.
 *
 * _Available since v4.3._
 */
abstract contract IGovernorTimelockUpgradeable is
  Initializable,
  IGovernorUpgradeable
{
  function __IGovernorTimelock_init() internal onlyInitializing {}

  function __IGovernorTimelock_init_unchained() internal onlyInitializing {}

  event ProposalQueued(uint256 proposalId, uint256 eta);

  function timelock() public view virtual returns (address);

  function proposalEta(
    uint256 proposalId
  ) public view virtual returns (uint256);

  function queue(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public virtual returns (uint256 proposalId);

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}

// File @openzeppelin/contracts-upgradeable/governance/TimelockControllerUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/TimelockController.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which acts as a timelocked controller. When set as the
 * owner of an `Ownable` smart contract, it enforces a timelock on all
 * `onlyOwner` maintenance operations. This gives time for users of the
 * controlled contract to exit before a potentially dangerous maintenance
 * operation is applied.
 *
 * By default, this contract is self administered, meaning administration tasks
 * have to go through the timelock process. The proposer (resp executor) role
 * is in charge of proposing (resp executing) operations. A common use case is
 * to position this {TimelockController} as the owner of a smart contract, with
 * a multisig or a DAO as the sole proposer.
 *
 * _Available since v3.3._
 */
contract TimelockControllerUpgradeable is
  Initializable,
  AccessControlUpgradeable,
  IERC721ReceiverUpgradeable,
  IERC1155ReceiverUpgradeable
{
  bytes32 public constant TIMELOCK_ADMIN_ROLE =
    keccak256("TIMELOCK_ADMIN_ROLE");
  bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
  bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
  bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
  uint256 internal constant _DONE_TIMESTAMP = uint256(1);

  mapping(bytes32 => uint256) private _timestamps;
  uint256 private _minDelay;

  /**
   * @dev Emitted when a call is scheduled as part of operation `id`.
   */
  event CallScheduled(
    bytes32 indexed id,
    uint256 indexed index,
    address target,
    uint256 value,
    bytes data,
    bytes32 predecessor,
    uint256 delay
  );

  /**
   * @dev Emitted when a call is performed as part of operation `id`.
   */
  event CallExecuted(
    bytes32 indexed id,
    uint256 indexed index,
    address target,
    uint256 value,
    bytes data
  );

  /**
   * @dev Emitted when new proposal is scheduled with non-zero salt.
   */
  event CallSalt(bytes32 indexed id, bytes32 salt);

  /**
   * @dev Emitted when operation `id` is cancelled.
   */
  event Cancelled(bytes32 indexed id);

  /**
   * @dev Emitted when the minimum delay for future operations is modified.
   */
  event MinDelayChange(uint256 oldDuration, uint256 newDuration);

  /**
   * @dev Initializes the contract with the following parameters:
   *
   * - `minDelay`: initial minimum delay for operations
   * - `proposers`: accounts to be granted proposer and canceller roles
   * - `executors`: accounts to be granted executor role
   * - `admin`: optional account to be granted admin role; disable with zero address
   *
   * IMPORTANT: The optional admin can aid with initial configuration of roles after deployment
   * without being subject to delay, but this role should be subsequently renounced in favor of
   * administration through timelocked proposals. Previous versions of this contract would assign
   * this admin to the deployer automatically and should be renounced as well.
   */
  function __TimelockController_init(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) internal onlyInitializing {
    __TimelockController_init_unchained(minDelay, proposers, executors, admin);
  }

  function __TimelockController_init_unchained(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) internal onlyInitializing {
    _setRoleAdmin(TIMELOCK_ADMIN_ROLE, TIMELOCK_ADMIN_ROLE);
    _setRoleAdmin(PROPOSER_ROLE, TIMELOCK_ADMIN_ROLE);
    _setRoleAdmin(EXECUTOR_ROLE, TIMELOCK_ADMIN_ROLE);
    _setRoleAdmin(CANCELLER_ROLE, TIMELOCK_ADMIN_ROLE);

    // self administration
    _setupRole(TIMELOCK_ADMIN_ROLE, address(this));

    // optional admin
    if (admin != address(0)) {
      _setupRole(TIMELOCK_ADMIN_ROLE, admin);
    }

    // register proposers and cancellers
    for (uint256 i = 0; i < proposers.length; ++i) {
      _setupRole(PROPOSER_ROLE, proposers[i]);
      _setupRole(CANCELLER_ROLE, proposers[i]);
    }

    // register executors
    for (uint256 i = 0; i < executors.length; ++i) {
      _setupRole(EXECUTOR_ROLE, executors[i]);
    }

    _minDelay = minDelay;
    emit MinDelayChange(0, minDelay);
  }

  /**
   * @dev Modifier to make a function callable only by a certain role. In
   * addition to checking the sender's role, `address(0)` 's role is also
   * considered. Granting a role to `address(0)` is equivalent to enabling
   * this role for everyone.
   */
  modifier onlyRoleOrOpenRole(bytes32 role) {
    if (!hasRole(role, address(0))) {
      _checkRole(role, _msgSender());
    }
    _;
  }

  /**
   * @dev Contract might receive/hold ETH as part of the maintenance process.
   */
  receive() external payable {}

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(IERC165Upgradeable, AccessControlUpgradeable)
    returns (bool)
  {
    return
      interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @dev Returns whether an id correspond to a registered operation. This
   * includes both Pending, Ready and Done operations.
   */
  function isOperation(bytes32 id) public view virtual returns (bool) {
    return getTimestamp(id) > 0;
  }

  /**
   * @dev Returns whether an operation is pending or not. Note that a "pending" operation may also be "ready".
   */
  function isOperationPending(bytes32 id) public view virtual returns (bool) {
    return getTimestamp(id) > _DONE_TIMESTAMP;
  }

  /**
   * @dev Returns whether an operation is ready for execution. Note that a "ready" operation is also "pending".
   */
  function isOperationReady(bytes32 id) public view virtual returns (bool) {
    uint256 timestamp = getTimestamp(id);
    return timestamp > _DONE_TIMESTAMP && timestamp <= block.timestamp;
  }

  /**
   * @dev Returns whether an operation is done or not.
   */
  function isOperationDone(bytes32 id) public view virtual returns (bool) {
    return getTimestamp(id) == _DONE_TIMESTAMP;
  }

  /**
   * @dev Returns the timestamp at which an operation becomes ready (0 for
   * unset operations, 1 for done operations).
   */
  function getTimestamp(bytes32 id) public view virtual returns (uint256) {
    return _timestamps[id];
  }

  /**
   * @dev Returns the minimum delay for an operation to become valid.
   *
   * This value can be changed by executing an operation that calls `updateDelay`.
   */
  function getMinDelay() public view virtual returns (uint256) {
    return _minDelay;
  }

  /**
   * @dev Returns the identifier of an operation containing a single
   * transaction.
   */
  function hashOperation(
    address target,
    uint256 value,
    bytes calldata data,
    bytes32 predecessor,
    bytes32 salt
  ) public pure virtual returns (bytes32) {
    return keccak256(abi.encode(target, value, data, predecessor, salt));
  }

  /**
   * @dev Returns the identifier of an operation containing a batch of
   * transactions.
   */
  function hashOperationBatch(
    address[] calldata targets,
    uint256[] calldata values,
    bytes[] calldata payloads,
    bytes32 predecessor,
    bytes32 salt
  ) public pure virtual returns (bytes32) {
    return keccak256(abi.encode(targets, values, payloads, predecessor, salt));
  }

  /**
   * @dev Schedule an operation containing a single transaction.
   *
   * Emits {CallSalt} if salt is nonzero, and {CallScheduled}.
   *
   * Requirements:
   *
   * - the caller must have the 'proposer' role.
   */
  function schedule(
    address target,
    uint256 value,
    bytes calldata data,
    bytes32 predecessor,
    bytes32 salt,
    uint256 delay
  ) public virtual onlyRole(PROPOSER_ROLE) {
    bytes32 id = hashOperation(target, value, data, predecessor, salt);
    _schedule(id, delay);
    emit CallScheduled(id, 0, target, value, data, predecessor, delay);
    if (salt != bytes32(0)) {
      emit CallSalt(id, salt);
    }
  }

  /**
   * @dev Schedule an operation containing a batch of transactions.
   *
   * Emits {CallSalt} if salt is nonzero, and one {CallScheduled} event per transaction in the batch.
   *
   * Requirements:
   *
   * - the caller must have the 'proposer' role.
   */
  function scheduleBatch(
    address[] calldata targets,
    uint256[] calldata values,
    bytes[] calldata payloads,
    bytes32 predecessor,
    bytes32 salt,
    uint256 delay
  ) public virtual onlyRole(PROPOSER_ROLE) {
    require(
      targets.length == values.length,
      "TimelockController: length mismatch"
    );
    require(
      targets.length == payloads.length,
      "TimelockController: length mismatch"
    );

    bytes32 id = hashOperationBatch(
      targets,
      values,
      payloads,
      predecessor,
      salt
    );
    _schedule(id, delay);
    for (uint256 i = 0; i < targets.length; ++i) {
      emit CallScheduled(
        id,
        i,
        targets[i],
        values[i],
        payloads[i],
        predecessor,
        delay
      );
    }
    if (salt != bytes32(0)) {
      emit CallSalt(id, salt);
    }
  }

  /**
   * @dev Schedule an operation that is to become valid after a given delay.
   */
  function _schedule(bytes32 id, uint256 delay) private {
    require(
      !isOperation(id),
      "TimelockController: operation already scheduled"
    );
    require(delay >= getMinDelay(), "TimelockController: insufficient delay");
    _timestamps[id] = block.timestamp + delay;
  }

  /**
   * @dev Cancel an operation.
   *
   * Requirements:
   *
   * - the caller must have the 'canceller' role.
   */
  function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {
    require(
      isOperationPending(id),
      "TimelockController: operation cannot be cancelled"
    );
    delete _timestamps[id];

    emit Cancelled(id);
  }

  /**
   * @dev Execute an (ready) operation containing a single transaction.
   *
   * Emits a {CallExecuted} event.
   *
   * Requirements:
   *
   * - the caller must have the 'executor' role.
   */
  // This function can reenter, but it doesn't pose a risk because _afterCall checks that the proposal is pending,
  // thus any modifications to the operation during reentrancy should be caught.
  // slither-disable-next-line reentrancy-eth
  function execute(
    address target,
    uint256 value,
    bytes calldata payload,
    bytes32 predecessor,
    bytes32 salt
  ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
    bytes32 id = hashOperation(target, value, payload, predecessor, salt);

    _beforeCall(id, predecessor);
    _execute(target, value, payload);
    emit CallExecuted(id, 0, target, value, payload);
    _afterCall(id);
  }

  /**
   * @dev Execute an (ready) operation containing a batch of transactions.
   *
   * Emits one {CallExecuted} event per transaction in the batch.
   *
   * Requirements:
   *
   * - the caller must have the 'executor' role.
   */
  // This function can reenter, but it doesn't pose a risk because _afterCall checks that the proposal is pending,
  // thus any modifications to the operation during reentrancy should be caught.
  // slither-disable-next-line reentrancy-eth
  function executeBatch(
    address[] calldata targets,
    uint256[] calldata values,
    bytes[] calldata payloads,
    bytes32 predecessor,
    bytes32 salt
  ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
    require(
      targets.length == values.length,
      "TimelockController: length mismatch"
    );
    require(
      targets.length == payloads.length,
      "TimelockController: length mismatch"
    );

    bytes32 id = hashOperationBatch(
      targets,
      values,
      payloads,
      predecessor,
      salt
    );

    _beforeCall(id, predecessor);
    for (uint256 i = 0; i < targets.length; ++i) {
      address target = targets[i];
      uint256 value = values[i];
      bytes calldata payload = payloads[i];
      _execute(target, value, payload);
      emit CallExecuted(id, i, target, value, payload);
    }
    _afterCall(id);
  }

  /**
   * @dev Execute an operation's call.
   */
  function _execute(
    address target,
    uint256 value,
    bytes calldata data
  ) internal virtual {
    (bool success, ) = target.call{value: value}(data);
    require(success, "TimelockController: underlying transaction reverted");
  }

  /**
   * @dev Checks before execution of an operation's calls.
   */
  function _beforeCall(bytes32 id, bytes32 predecessor) private view {
    require(isOperationReady(id), "TimelockController: operation is not ready");
    require(
      predecessor == bytes32(0) || isOperationDone(predecessor),
      "TimelockController: missing dependency"
    );
  }

  /**
   * @dev Checks after execution of an operation's calls.
   */
  function _afterCall(bytes32 id) private {
    require(isOperationReady(id), "TimelockController: operation is not ready");
    _timestamps[id] = _DONE_TIMESTAMP;
  }

  /**
   * @dev Changes the minimum timelock duration for future operations.
   *
   * Emits a {MinDelayChange} event.
   *
   * Requirements:
   *
   * - the caller must be the timelock itself. This can only be achieved by scheduling and later executing
   * an operation where the timelock is the target and the data is the ABI-encoded call to this function.
   */
  function updateDelay(uint256 newDelay) external virtual {
    require(
      msg.sender == address(this),
      "TimelockController: caller must be timelock"
    );
    emit MinDelayChange(_minDelay, newDelay);
    _minDelay = newDelay;
  }

  /**
   * @dev See {IERC721Receiver-onERC721Received}.
   */
  function onERC721Received(
    address,
    address,
    uint256,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC721Received.selector;
  }

  /**
   * @dev See {IERC1155Receiver-onERC1155Received}.
   */
  function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155Received.selector;
  }

  /**
   * @dev See {IERC1155Receiver-onERC1155BatchReceived}.
   */
  function onERC1155BatchReceived(
    address,
    address,
    uint256[] memory,
    uint256[] memory,
    bytes memory
  ) public virtual override returns (bytes4) {
    return this.onERC1155BatchReceived.selector;
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[48] private __gap;
}

// File @openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/extensions/GovernorTimelockControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of {Governor} that binds the execution process to an instance of {TimelockController}. This adds a
 * delay, enforced by the {TimelockController} to all successful proposal (in addition to the voting duration). The
 * {Governor} needs the proposer (and ideally the executor) roles for the {Governor} to work properly.
 *
 * Using this model means the proposal will be operated by the {TimelockController} and not by the {Governor}. Thus,
 * the assets and permissions must be attached to the {TimelockController}. Any asset sent to the {Governor} will be
 * inaccessible.
 *
 * WARNING: Setting up the TimelockController to have additional proposers besides the governor is very risky, as it
 * grants them powers that they must be trusted or known not to use: 1) {onlyGovernance} functions like {relay} are
 * available to them through the timelock, and 2) approved governance proposals can be blocked by them, effectively
 * executing a Denial of Service attack. This risk will be mitigated in a future release.
 *
 * _Available since v4.3._
 */
abstract contract GovernorTimelockControlUpgradeable is
  Initializable,
  IGovernorTimelockUpgradeable,
  GovernorUpgradeable
{
  TimelockControllerUpgradeable private _timelock;
  mapping(uint256 => bytes32) private _timelockIds;

  /**
   * @dev Emitted when the timelock controller used for proposal execution is modified.
   */
  event TimelockChange(address oldTimelock, address newTimelock);

  /**
   * @dev Set the timelock.
   */
  function __GovernorTimelockControl_init(
    TimelockControllerUpgradeable timelockAddress
  ) internal onlyInitializing {
    __GovernorTimelockControl_init_unchained(timelockAddress);
  }

  function __GovernorTimelockControl_init_unchained(
    TimelockControllerUpgradeable timelockAddress
  ) internal onlyInitializing {
    _updateTimelock(timelockAddress);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(IERC165Upgradeable, GovernorUpgradeable)
    returns (bool)
  {
    return
      interfaceId == type(IGovernorTimelockUpgradeable).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @dev Overridden version of the {Governor-state} function with added support for the `Queued` state.
   */
  function state(
    uint256 proposalId
  )
    public
    view
    virtual
    override(IGovernorUpgradeable, GovernorUpgradeable)
    returns (ProposalState)
  {
    ProposalState currentState = super.state(proposalId);

    if (currentState != ProposalState.Succeeded) {
      return currentState;
    }

    // core tracks execution, so we just have to check if successful proposal have been queued.
    bytes32 queueid = _timelockIds[proposalId];
    if (queueid == bytes32(0)) {
      return currentState;
    } else if (_timelock.isOperationDone(queueid)) {
      return ProposalState.Executed;
    } else if (_timelock.isOperationPending(queueid)) {
      return ProposalState.Queued;
    } else {
      return ProposalState.Canceled;
    }
  }

  /**
   * @dev Public accessor to check the address of the timelock
   */
  function timelock() public view virtual override returns (address) {
    return address(_timelock);
  }

  /**
   * @dev Public accessor to check the eta of a queued proposal
   */
  function proposalEta(
    uint256 proposalId
  ) public view virtual override returns (uint256) {
    uint256 eta = _timelock.getTimestamp(_timelockIds[proposalId]);
    return eta == 1 ? 0 : eta; // _DONE_TIMESTAMP (1) should be replaced with a 0 value
  }

  /**
   * @dev Function to queue a proposal to the timelock.
   */
  function queue(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public virtual override returns (uint256) {
    uint256 proposalId = hashProposal(
      targets,
      values,
      calldatas,
      descriptionHash
    );

    require(
      state(proposalId) == ProposalState.Succeeded,
      "Governor: proposal not successful"
    );

    uint256 delay = _timelock.getMinDelay();
    _timelockIds[proposalId] = _timelock.hashOperationBatch(
      targets,
      values,
      calldatas,
      0,
      descriptionHash
    );
    _timelock.scheduleBatch(
      targets,
      values,
      calldatas,
      0,
      descriptionHash,
      delay
    );

    emit ProposalQueued(proposalId, block.timestamp + delay);

    return proposalId;
  }

  /**
   * @dev Overridden execute function that run the already queued proposal through the timelock.
   */
  function _execute(
    uint256 /* proposalId */,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal virtual override {
    _timelock.executeBatch{value: msg.value}(
      targets,
      values,
      calldatas,
      0,
      descriptionHash
    );
  }

  /**
   * @dev Overridden version of the {Governor-_cancel} function to cancel the timelocked proposal if it as already
   * been queued.
   */
  // This function can reenter through the external call to the timelock, but we assume the timelock is trusted and
  // well behaved (according to TimelockController) and this will not happen.
  // slither-disable-next-line reentrancy-no-eth
  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal virtual override returns (uint256) {
    uint256 proposalId = super._cancel(
      targets,
      values,
      calldatas,
      descriptionHash
    );

    if (_timelockIds[proposalId] != 0) {
      _timelock.cancel(_timelockIds[proposalId]);
      delete _timelockIds[proposalId];
    }

    return proposalId;
  }

  /**
   * @dev Address through which the governor executes action. In this case, the timelock.
   */
  function _executor() internal view virtual override returns (address) {
    return address(_timelock);
  }

  /**
   * @dev Public endpoint to update the underlying timelock instance. Restricted to the timelock itself, so updates
   * must be proposed, scheduled, and executed through governance proposals.
   *
   * CAUTION: It is not recommended to change the timelock while there are other queued governance proposals.
   */
  function updateTimelock(
    TimelockControllerUpgradeable newTimelock
  ) external virtual onlyGovernance {
    _updateTimelock(newTimelock);
  }

  function _updateTimelock(TimelockControllerUpgradeable newTimelock) private {
    emit TimelockChange(address(_timelock), address(newTimelock));
    _timelock = newTimelock;
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[48] private __gap;
}

// File @openzeppelin/contracts-upgradeable/governance/utils/IVotesUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/utils/IVotes.sol)
pragma solidity ^0.8.0;

/**
 * @dev Common interface for {ERC20Votes}, {ERC721Votes}, and other {Votes}-enabled contracts.
 *
 * _Available since v4.5._
 */
interface IVotesUpgradeable {
  /**
   * @dev Emitted when an account changes their delegate.
   */
  event DelegateChanged(
    address indexed delegator,
    address indexed fromDelegate,
    address indexed toDelegate
  );

  /**
   * @dev Emitted when a token transfer or delegate change results in changes to a delegate's number of votes.
   */
  event DelegateVotesChanged(
    address indexed delegate,
    uint256 previousBalance,
    uint256 newBalance
  );

  /**
   * @dev Returns the current amount of votes that `account` has.
   */
  function getVotes(address account) external view returns (uint256);

  /**
   * @dev Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is
   * configured to use block numbers, this will return the value at the end of the corresponding block.
   */
  function getPastVotes(
    address account,
    uint256 timepoint
  ) external view returns (uint256);

  /**
   * @dev Returns the total supply of votes available at a specific moment in the past. If the `clock()` is
   * configured to use block numbers, this will return the value at the end of the corresponding block.
   *
   * NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes.
   * Votes that have not been delegated are still part of total supply, even though they would not participate in a
   * vote.
   */
  function getPastTotalSupply(
    uint256 timepoint
  ) external view returns (uint256);

  /**
   * @dev Returns the delegate that `account` has chosen.
   */
  function delegates(address account) external view returns (address);

  /**
   * @dev Delegates votes from the sender to `delegatee`.
   */
  function delegate(address delegatee) external;

  /**
   * @dev Delegates votes from signer to `delegatee`.
   */
  function delegateBySig(
    address delegatee,
    uint256 nonce,
    uint256 expiry,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
}

// File @openzeppelin/contracts-upgradeable/interfaces/IERC5805Upgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (interfaces/IERC5805.sol)

pragma solidity ^0.8.0;

interface IERC5805Upgradeable is IERC6372Upgradeable, IVotesUpgradeable {}

// File @openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/extensions/GovernorVotes.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of {Governor} for voting weight extraction from an {ERC20Votes} token, or since v4.5 an {ERC721Votes} token.
 *
 * _Available since v4.3._
 *
 * @custom:storage-size 51
 */
abstract contract GovernorVotesUpgradeable is
  Initializable,
  GovernorUpgradeable
{
  IERC5805Upgradeable public token;

  function __GovernorVotes_init(
    IVotesUpgradeable tokenAddress
  ) internal onlyInitializing {
    __GovernorVotes_init_unchained(tokenAddress);
  }

  function __GovernorVotes_init_unchained(
    IVotesUpgradeable tokenAddress
  ) internal onlyInitializing {
    token = IERC5805Upgradeable(address(tokenAddress));
  }

  /**
   * @dev Clock (as specified in EIP-6372) is set to match the token's clock. Fallback to block numbers if the token
   * does not implement EIP-6372.
   */
  function clock() public view virtual override returns (uint48) {
    try token.clock() returns (uint48 timepoint) {
      return timepoint;
    } catch {
      return SafeCastUpgradeable.toUint48(block.number);
    }
  }

  /**
   * @dev Machine-readable description of the clock as specified in EIP-6372.
   */
  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() public view virtual override returns (string memory) {
    try token.CLOCK_MODE() returns (string memory clockmode) {
      return clockmode;
    } catch {
      return "mode=blocknumber&from=default";
    }
  }

  /**
   * Read the voting weight from the token's built in snapshot mechanism (see {Governor-_getVotes}).
   */
  function _getVotes(
    address account,
    uint256 timepoint,
    bytes memory /*params*/
  ) internal view virtual override returns (uint256) {
    return token.getPastVotes(account, timepoint);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[50] private __gap;
}

// File @openzeppelin/contracts-upgradeable/utils/CheckpointsUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Checkpoints.sol)
// This file was procedurally generated from scripts/generate/templates/Checkpoints.js.

pragma solidity ^0.8.0;

/**
 * @dev This library defines the `History` struct, for checkpointing values as they change at different points in
 * time, and later looking up past values by block number. See {Votes} as an example.
 *
 * To create a history of checkpoints define a variable type `Checkpoints.History` in your contract, and store a new
 * checkpoint for the current transaction block using the {push} function.
 *
 * _Available since v4.5._
 */
library CheckpointsUpgradeable {
  struct History {
    Checkpoint[] _checkpoints;
  }

  struct Checkpoint {
    uint32 _blockNumber;
    uint224 _value;
  }

  /**
   * @dev Returns the value at a given block number. If a checkpoint is not available at that block, the closest one
   * before it is returned, or zero otherwise. Because the number returned corresponds to that at the end of the
   * block, the requested block number must be in the past, excluding the current block.
   */
  function getAtBlock(
    History storage self,
    uint256 blockNumber
  ) internal view returns (uint256) {
    require(blockNumber < block.number, "Checkpoints: block not yet mined");
    uint32 key = SafeCastUpgradeable.toUint32(blockNumber);

    uint256 len = self._checkpoints.length;
    uint256 pos = _upperBinaryLookup(self._checkpoints, key, 0, len);
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns the value at a given block number. If a checkpoint is not available at that block, the closest one
   * before it is returned, or zero otherwise. Similar to {upperLookup} but optimized for the case when the searched
   * checkpoint is probably "recent", defined as being among the last sqrt(N) checkpoints where N is the number of
   * checkpoints.
   */
  function getAtProbablyRecentBlock(
    History storage self,
    uint256 blockNumber
  ) internal view returns (uint256) {
    require(blockNumber < block.number, "Checkpoints: block not yet mined");
    uint32 key = SafeCastUpgradeable.toUint32(blockNumber);

    uint256 len = self._checkpoints.length;

    uint256 low = 0;
    uint256 high = len;

    if (len > 5) {
      uint256 mid = len - MathUpgradeable.sqrt(len);
      if (key < _unsafeAccess(self._checkpoints, mid)._blockNumber) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    uint256 pos = _upperBinaryLookup(self._checkpoints, key, low, high);

    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Pushes a value onto a History so that it is stored as the checkpoint for the current block.
   *
   * Returns previous value and new value.
   */
  function push(
    History storage self,
    uint256 value
  ) internal returns (uint256, uint256) {
    return
      _insert(
        self._checkpoints,
        SafeCastUpgradeable.toUint32(block.number),
        SafeCastUpgradeable.toUint224(value)
      );
  }

  /**
   * @dev Pushes a value onto a History, by updating the latest value using binary operation `op`. The new value will
   * be set to `op(latest, delta)`.
   *
   * Returns previous value and new value.
   */
  function push(
    History storage self,
    function(uint256, uint256) view returns (uint256) op,
    uint256 delta
  ) internal returns (uint256, uint256) {
    return push(self, op(latest(self), delta));
  }

  /**
   * @dev Returns the value in the most recent checkpoint, or zero if there are no checkpoints.
   */
  function latest(History storage self) internal view returns (uint224) {
    uint256 pos = self._checkpoints.length;
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns whether there is a checkpoint in the structure (i.e. it is not empty), and if so the key and value
   * in the most recent checkpoint.
   */
  function latestCheckpoint(
    History storage self
  ) internal view returns (bool exists, uint32 _blockNumber, uint224 _value) {
    uint256 pos = self._checkpoints.length;
    if (pos == 0) {
      return (false, 0, 0);
    } else {
      Checkpoint memory ckpt = _unsafeAccess(self._checkpoints, pos - 1);
      return (true, ckpt._blockNumber, ckpt._value);
    }
  }

  /**
   * @dev Returns the number of checkpoint.
   */
  function length(History storage self) internal view returns (uint256) {
    return self._checkpoints.length;
  }

  /**
   * @dev Pushes a (`key`, `value`) pair into an ordered list of checkpoints, either by inserting a new checkpoint,
   * or by updating the last one.
   */
  function _insert(
    Checkpoint[] storage self,
    uint32 key,
    uint224 value
  ) private returns (uint224, uint224) {
    uint256 pos = self.length;

    if (pos > 0) {
      // Copying to memory is important here.
      Checkpoint memory last = _unsafeAccess(self, pos - 1);

      // Checkpoint keys must be non-decreasing.
      require(last._blockNumber <= key, "Checkpoint: decreasing keys");

      // Update or push new checkpoint
      if (last._blockNumber == key) {
        _unsafeAccess(self, pos - 1)._value = value;
      } else {
        self.push(Checkpoint({_blockNumber: key, _value: value}));
      }
      return (last._value, value);
    } else {
      self.push(Checkpoint({_blockNumber: key, _value: value}));
      return (0, value);
    }
  }

  /**
   * @dev Return the index of the last (most recent) checkpoint with key lower or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _upperBinaryLookup(
    Checkpoint[] storage self,
    uint32 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._blockNumber > key) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return high;
  }

  /**
   * @dev Return the index of the first (oldest) checkpoint with key is greater or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _lowerBinaryLookup(
    Checkpoint[] storage self,
    uint32 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._blockNumber < key) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  }

  /**
   * @dev Access an element of the array without performing bounds check. The position is assumed to be within bounds.
   */
  function _unsafeAccess(
    Checkpoint[] storage self,
    uint256 pos
  ) private pure returns (Checkpoint storage result) {
    assembly {
      mstore(0, self.slot)
      result.slot := add(keccak256(0, 0x20), pos)
    }
  }

  struct Trace224 {
    Checkpoint224[] _checkpoints;
  }

  struct Checkpoint224 {
    uint32 _key;
    uint224 _value;
  }

  /**
   * @dev Pushes a (`key`, `value`) pair into a Trace224 so that it is stored as the checkpoint.
   *
   * Returns previous value and new value.
   */
  function push(
    Trace224 storage self,
    uint32 key,
    uint224 value
  ) internal returns (uint224, uint224) {
    return _insert(self._checkpoints, key, value);
  }

  /**
   * @dev Returns the value in the first (oldest) checkpoint with key greater or equal than the search key, or zero if there is none.
   */
  function lowerLookup(
    Trace224 storage self,
    uint32 key
  ) internal view returns (uint224) {
    uint256 len = self._checkpoints.length;
    uint256 pos = _lowerBinaryLookup(self._checkpoints, key, 0, len);
    return pos == len ? 0 : _unsafeAccess(self._checkpoints, pos)._value;
  }

  /**
   * @dev Returns the value in the last (most recent) checkpoint with key lower or equal than the search key, or zero if there is none.
   */
  function upperLookup(
    Trace224 storage self,
    uint32 key
  ) internal view returns (uint224) {
    uint256 len = self._checkpoints.length;
    uint256 pos = _upperBinaryLookup(self._checkpoints, key, 0, len);
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns the value in the last (most recent) checkpoint with key lower or equal than the search key, or zero if there is none.
   *
   * NOTE: This is a variant of {upperLookup} that is optimised to find "recent" checkpoint (checkpoints with high keys).
   */
  function upperLookupRecent(
    Trace224 storage self,
    uint32 key
  ) internal view returns (uint224) {
    uint256 len = self._checkpoints.length;

    uint256 low = 0;
    uint256 high = len;

    if (len > 5) {
      uint256 mid = len - MathUpgradeable.sqrt(len);
      if (key < _unsafeAccess(self._checkpoints, mid)._key) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    uint256 pos = _upperBinaryLookup(self._checkpoints, key, low, high);

    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns the value in the most recent checkpoint, or zero if there are no checkpoints.
   */
  function latest(Trace224 storage self) internal view returns (uint224) {
    uint256 pos = self._checkpoints.length;
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns whether there is a checkpoint in the structure (i.e. it is not empty), and if so the key and value
   * in the most recent checkpoint.
   */
  function latestCheckpoint(
    Trace224 storage self
  ) internal view returns (bool exists, uint32 _key, uint224 _value) {
    uint256 pos = self._checkpoints.length;
    if (pos == 0) {
      return (false, 0, 0);
    } else {
      Checkpoint224 memory ckpt = _unsafeAccess(self._checkpoints, pos - 1);
      return (true, ckpt._key, ckpt._value);
    }
  }

  /**
   * @dev Returns the number of checkpoint.
   */
  function length(Trace224 storage self) internal view returns (uint256) {
    return self._checkpoints.length;
  }

  /**
   * @dev Pushes a (`key`, `value`) pair into an ordered list of checkpoints, either by inserting a new checkpoint,
   * or by updating the last one.
   */
  function _insert(
    Checkpoint224[] storage self,
    uint32 key,
    uint224 value
  ) private returns (uint224, uint224) {
    uint256 pos = self.length;

    if (pos > 0) {
      // Copying to memory is important here.
      Checkpoint224 memory last = _unsafeAccess(self, pos - 1);

      // Checkpoint keys must be non-decreasing.
      require(last._key <= key, "Checkpoint: decreasing keys");

      // Update or push new checkpoint
      if (last._key == key) {
        _unsafeAccess(self, pos - 1)._value = value;
      } else {
        self.push(Checkpoint224({_key: key, _value: value}));
      }
      return (last._value, value);
    } else {
      self.push(Checkpoint224({_key: key, _value: value}));
      return (0, value);
    }
  }

  /**
   * @dev Return the index of the last (most recent) checkpoint with key lower or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _upperBinaryLookup(
    Checkpoint224[] storage self,
    uint32 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._key > key) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return high;
  }

  /**
   * @dev Return the index of the first (oldest) checkpoint with key is greater or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _lowerBinaryLookup(
    Checkpoint224[] storage self,
    uint32 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._key < key) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  }

  /**
   * @dev Access an element of the array without performing bounds check. The position is assumed to be within bounds.
   */
  function _unsafeAccess(
    Checkpoint224[] storage self,
    uint256 pos
  ) private pure returns (Checkpoint224 storage result) {
    assembly {
      mstore(0, self.slot)
      result.slot := add(keccak256(0, 0x20), pos)
    }
  }

  struct Trace160 {
    Checkpoint160[] _checkpoints;
  }

  struct Checkpoint160 {
    uint96 _key;
    uint160 _value;
  }

  /**
   * @dev Pushes a (`key`, `value`) pair into a Trace160 so that it is stored as the checkpoint.
   *
   * Returns previous value and new value.
   */
  function push(
    Trace160 storage self,
    uint96 key,
    uint160 value
  ) internal returns (uint160, uint160) {
    return _insert(self._checkpoints, key, value);
  }

  /**
   * @dev Returns the value in the first (oldest) checkpoint with key greater or equal than the search key, or zero if there is none.
   */
  function lowerLookup(
    Trace160 storage self,
    uint96 key
  ) internal view returns (uint160) {
    uint256 len = self._checkpoints.length;
    uint256 pos = _lowerBinaryLookup(self._checkpoints, key, 0, len);
    return pos == len ? 0 : _unsafeAccess(self._checkpoints, pos)._value;
  }

  /**
   * @dev Returns the value in the last (most recent) checkpoint with key lower or equal than the search key, or zero if there is none.
   */
  function upperLookup(
    Trace160 storage self,
    uint96 key
  ) internal view returns (uint160) {
    uint256 len = self._checkpoints.length;
    uint256 pos = _upperBinaryLookup(self._checkpoints, key, 0, len);
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns the value in the last (most recent) checkpoint with key lower or equal than the search key, or zero if there is none.
   *
   * NOTE: This is a variant of {upperLookup} that is optimised to find "recent" checkpoint (checkpoints with high keys).
   */
  function upperLookupRecent(
    Trace160 storage self,
    uint96 key
  ) internal view returns (uint160) {
    uint256 len = self._checkpoints.length;

    uint256 low = 0;
    uint256 high = len;

    if (len > 5) {
      uint256 mid = len - MathUpgradeable.sqrt(len);
      if (key < _unsafeAccess(self._checkpoints, mid)._key) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    uint256 pos = _upperBinaryLookup(self._checkpoints, key, low, high);

    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns the value in the most recent checkpoint, or zero if there are no checkpoints.
   */
  function latest(Trace160 storage self) internal view returns (uint160) {
    uint256 pos = self._checkpoints.length;
    return pos == 0 ? 0 : _unsafeAccess(self._checkpoints, pos - 1)._value;
  }

  /**
   * @dev Returns whether there is a checkpoint in the structure (i.e. it is not empty), and if so the key and value
   * in the most recent checkpoint.
   */
  function latestCheckpoint(
    Trace160 storage self
  ) internal view returns (bool exists, uint96 _key, uint160 _value) {
    uint256 pos = self._checkpoints.length;
    if (pos == 0) {
      return (false, 0, 0);
    } else {
      Checkpoint160 memory ckpt = _unsafeAccess(self._checkpoints, pos - 1);
      return (true, ckpt._key, ckpt._value);
    }
  }

  /**
   * @dev Returns the number of checkpoint.
   */
  function length(Trace160 storage self) internal view returns (uint256) {
    return self._checkpoints.length;
  }

  /**
   * @dev Pushes a (`key`, `value`) pair into an ordered list of checkpoints, either by inserting a new checkpoint,
   * or by updating the last one.
   */
  function _insert(
    Checkpoint160[] storage self,
    uint96 key,
    uint160 value
  ) private returns (uint160, uint160) {
    uint256 pos = self.length;

    if (pos > 0) {
      // Copying to memory is important here.
      Checkpoint160 memory last = _unsafeAccess(self, pos - 1);

      // Checkpoint keys must be non-decreasing.
      require(last._key <= key, "Checkpoint: decreasing keys");

      // Update or push new checkpoint
      if (last._key == key) {
        _unsafeAccess(self, pos - 1)._value = value;
      } else {
        self.push(Checkpoint160({_key: key, _value: value}));
      }
      return (last._value, value);
    } else {
      self.push(Checkpoint160({_key: key, _value: value}));
      return (0, value);
    }
  }

  /**
   * @dev Return the index of the last (most recent) checkpoint with key lower or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _upperBinaryLookup(
    Checkpoint160[] storage self,
    uint96 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._key > key) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return high;
  }

  /**
   * @dev Return the index of the first (oldest) checkpoint with key is greater or equal than the search key, or `high` if there is none.
   * `low` and `high` define a section where to do the search, with inclusive `low` and exclusive `high`.
   *
   * WARNING: `high` should not be greater than the array's length.
   */
  function _lowerBinaryLookup(
    Checkpoint160[] storage self,
    uint96 key,
    uint256 low,
    uint256 high
  ) private view returns (uint256) {
    while (low < high) {
      uint256 mid = MathUpgradeable.average(low, high);
      if (_unsafeAccess(self, mid)._key < key) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  }

  /**
   * @dev Access an element of the array without performing bounds check. The position is assumed to be within bounds.
   */
  function _unsafeAccess(
    Checkpoint160[] storage self,
    uint256 pos
  ) private pure returns (Checkpoint160 storage result) {
    assembly {
      mstore(0, self.slot)
      result.slot := add(keccak256(0, 0x20), pos)
    }
  }
}

// File @openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (governance/extensions/GovernorVotesQuorumFraction.sol)

pragma solidity ^0.8.0;

/**
 * @dev Extension of {Governor} for voting weight extraction from an {ERC20Votes} token and a quorum expressed as a
 * fraction of the total supply.
 *
 * _Available since v4.3._
 */
abstract contract GovernorVotesQuorumFractionUpgradeable is
  Initializable,
  GovernorVotesUpgradeable
{
  using CheckpointsUpgradeable for CheckpointsUpgradeable.Trace224;

  uint256 private _quorumNumerator; // DEPRECATED in favor of _quorumNumeratorHistory

  /// @custom:oz-retyped-from Checkpoints.History
  CheckpointsUpgradeable.Trace224 private _quorumNumeratorHistory;

  event QuorumNumeratorUpdated(
    uint256 oldQuorumNumerator,
    uint256 newQuorumNumerator
  );

  /**
   * @dev Initialize quorum as a fraction of the token's total supply.
   *
   * The fraction is specified as `numerator / denominator`. By default the denominator is 100, so quorum is
   * specified as a percent: a numerator of 10 corresponds to quorum being 10% of total supply. The denominator can be
   * customized by overriding {quorumDenominator}.
   */
  function __GovernorVotesQuorumFraction_init(
    uint256 quorumNumeratorValue
  ) internal onlyInitializing {
    __GovernorVotesQuorumFraction_init_unchained(quorumNumeratorValue);
  }

  function __GovernorVotesQuorumFraction_init_unchained(
    uint256 quorumNumeratorValue
  ) internal onlyInitializing {
    _updateQuorumNumerator(quorumNumeratorValue);
  }

  /**
   * @dev Returns the current quorum numerator. See {quorumDenominator}.
   */
  function quorumNumerator() public view virtual returns (uint256) {
    return
      _quorumNumeratorHistory._checkpoints.length == 0
        ? _quorumNumerator
        : _quorumNumeratorHistory.latest();
  }

  /**
   * @dev Returns the quorum numerator at a specific timepoint. See {quorumDenominator}.
   */
  function quorumNumerator(
    uint256 timepoint
  ) public view virtual returns (uint256) {
    // If history is empty, fallback to old storage
    uint256 length = _quorumNumeratorHistory._checkpoints.length;
    if (length == 0) {
      return _quorumNumerator;
    }

    // Optimistic search, check the latest checkpoint
    CheckpointsUpgradeable.Checkpoint224 memory latest = _quorumNumeratorHistory
      ._checkpoints[length - 1];
    if (latest._key <= timepoint) {
      return latest._value;
    }

    // Otherwise, do the binary search
    return
      _quorumNumeratorHistory.upperLookupRecent(
        SafeCastUpgradeable.toUint32(timepoint)
      );
  }

  /**
   * @dev Returns the quorum denominator. Defaults to 100, but may be overridden.
   */
  function quorumDenominator() public view virtual returns (uint256) {
    return 100;
  }

  /**
   * @dev Returns the quorum for a timepoint, in terms of number of votes: `supply * numerator / denominator`.
   */
  function quorum(
    uint256 timepoint
  ) public view virtual override returns (uint256) {
    return
      (token.getPastTotalSupply(timepoint) * quorumNumerator(timepoint)) /
      quorumDenominator();
  }

  /**
   * @dev Changes the quorum numerator.
   *
   * Emits a {QuorumNumeratorUpdated} event.
   *
   * Requirements:
   *
   * - Must be called through a governance proposal.
   * - New numerator must be smaller or equal to the denominator.
   */
  function updateQuorumNumerator(
    uint256 newQuorumNumerator
  ) external virtual onlyGovernance {
    _updateQuorumNumerator(newQuorumNumerator);
  }

  /**
   * @dev Changes the quorum numerator.
   *
   * Emits a {QuorumNumeratorUpdated} event.
   *
   * Requirements:
   *
   * - New numerator must be smaller or equal to the denominator.
   */
  function _updateQuorumNumerator(uint256 newQuorumNumerator) internal virtual {
    require(
      newQuorumNumerator <= quorumDenominator(),
      "GovernorVotesQuorumFraction: quorumNumerator over quorumDenominator"
    );

    uint256 oldQuorumNumerator = quorumNumerator();

    // Make sure we keep track of the original numerator in contracts upgraded from a version without checkpoints.
    if (
      oldQuorumNumerator != 0 &&
      _quorumNumeratorHistory._checkpoints.length == 0
    ) {
      _quorumNumeratorHistory._checkpoints.push(
        CheckpointsUpgradeable.Checkpoint224({
          _key: 0,
          _value: SafeCastUpgradeable.toUint224(oldQuorumNumerator)
        })
      );
    }

    // Set new quorum for future proposals
    _quorumNumeratorHistory.push(
      SafeCastUpgradeable.toUint32(clock()),
      SafeCastUpgradeable.toUint224(newQuorumNumerator)
    );

    emit QuorumNumeratorUpdated(oldQuorumNumerator, newQuorumNumerator);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
   */
  uint256[48] private __gap;
}

// File contracts/UnlockProtocolGovernor.sol

pragma solidity ^0.8.2;

contract UnlockProtocolGovernor is
  Initializable,
  GovernorUpgradeable,
  GovernorCountingSimpleUpgradeable,
  GovernorVotesUpgradeable,
  GovernorTimelockControlUpgradeable
{
  uint256 _votingDelay;
  uint256 _votingPeriod;
  uint256 _quorum;

  function initialize(
    IVotesUpgradeable _token,
    uint __votingDelay,
    uint __votingPeriod,
    uint __quorum,
    TimelockControllerUpgradeable _timelock
  ) public initializer {
    __Governor_init("Unlock Protocol Governor");
    __GovernorCountingSimple_init();
    __GovernorVotes_init(_token);
    __GovernorTimelockControl_init(_timelock);

    _votingDelay = __votingDelay;
    _votingPeriod = __votingPeriod;
    _quorum = __quorum;
  }

  /*
   * Events to track params changes
   */
  event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
  event VotingDelayUpdated(uint256 oldVotingDelay, uint256 newVotingDelay);
  event VotingPeriodUpdated(uint256 oldVotingPeriod, uint256 newVotingPeriod);

  function votingDelay() public view override returns (uint256) {
    return _votingDelay;
  }

  function votingPeriod() public view override returns (uint256) {
    return _votingPeriod;
  }

  function quorum(uint256 blockNumber) public view override returns (uint256) {
    require(blockNumber < block.number, "ERC20Votes: block not yet mined");
    return _quorum;
  }

  // governance setters
  function setVotingDelay(uint256 newVotingDelay) public onlyGovernance {
    uint256 oldVotingDelay = _votingDelay;
    _votingDelay = newVotingDelay;
    emit VotingDelayUpdated(oldVotingDelay, newVotingDelay);
  }

  function setVotingPeriod(uint256 newVotingPeriod) public onlyGovernance {
    uint256 oldVotingPeriod = _votingPeriod;
    _votingPeriod = newVotingPeriod;
    emit VotingPeriodUpdated(oldVotingPeriod, newVotingPeriod);
  }

  function setQuorum(uint256 newQuorum) public onlyGovernance {
    uint256 oldQuorum = _quorum;
    _quorum = newQuorum;
    emit QuorumUpdated(oldQuorum, newQuorum);
  }

  function state(
    uint256 proposalId
  )
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (ProposalState)
  {
    return super.state(proposalId);
  }

  function _execute(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) {
    super._execute(proposalId, targets, values, calldatas, descriptionHash);
  }

  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  )
    internal
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (uint256)
  {
    return super._cancel(targets, values, calldatas, descriptionHash);
  }

  function _executor()
    internal
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (address)
  {
    return super._executor();
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
