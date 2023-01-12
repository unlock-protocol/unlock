// Sources flattened with hardhat v2.8.0 https://hardhat.org

// File @openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol@v4.6.0

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (utils/Address.sol)

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
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
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
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
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
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
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
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
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
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
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
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}


// File @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol@v4.6.0

// OpenZeppelin Contracts (last updated v4.6.0) (proxy/utils/Initializable.sol)

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
 * ```
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
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
     * `onlyInitializing` functions can be used to initialize parent contracts. Equivalent to `reinitializer(1)`.
     */
    modifier initializer() {
        bool isTopLevelCall = _setInitializedVersion(1);
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
     * `initializer` is equivalent to `reinitializer(1)`, so a reinitializer may be used after the original
     * initialization step. This is essential to configure modules that are added through upgrades and that require
     * initialization.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     */
    modifier reinitializer(uint8 version) {
        bool isTopLevelCall = _setInitializedVersion(version);
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(version);
        }
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
     */
    function _disableInitializers() internal virtual {
        _setInitializedVersion(type(uint8).max);
    }

    function _setInitializedVersion(uint8 version) private returns (bool) {
        // If the contract is initializing we ignore whether _initialized is set in order to support multiple
        // inheritance patterns, but we only do this in the context of a constructor, and for the lowest level
        // of initializers, because in other contexts the contract may have been reentered.
        if (_initializing) {
            require(
                version == 1 && !AddressUpgradeable.isContract(address(this)),
                "Initializable: contract is already initialized"
            );
            return false;
        } else {
            require(_initialized < version, "Initializable: contract is already initialized");
            _initialized = version;
            return true;
        }
    }
}


// File @openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol@v4.6.0

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


// File @openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol@v4.6.0

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
    function __ERC165_init() internal onlyInitializing {
    }

    function __ERC165_init_unchained() internal onlyInitializing {
    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165Upgradeable).interfaceId;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}


// File @openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol@v4.6.0

// OpenZeppelin Contracts v4.4.1 (utils/introspection/ERC165Storage.sol)

pragma solidity ^0.8.0;


/**
 * @dev Storage based implementation of the {IERC165} interface.
 *
 * Contracts may inherit from this and call {_registerInterface} to declare
 * their support of an interface.
 */
abstract contract ERC165StorageUpgradeable is Initializable, ERC165Upgradeable {
    function __ERC165Storage_init() internal onlyInitializing {
    }

    function __ERC165Storage_init_unchained() internal onlyInitializing {
    }
    /**
     * @dev Mapping of interface ids to whether or not it's supported.
     */
    mapping(bytes4 => bool) private _supportedInterfaces;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId) || _supportedInterfaces[interfaceId];
    }

    /**
     * @dev Registers the contract as an implementer of the interface defined by
     * `interfaceId`. Support of the actual ERC165 interface is automatic and
     * registering its interface id is not required.
     *
     * See {IERC165-supportsInterface}.
     *
     * Requirements:
     *
     * - `interfaceId` cannot be the ERC165 invalid interface (`0xffffffff`).
     */
    function _registerInterface(bytes4 interfaceId) internal virtual {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}


// File contracts/mixins/MixinDisable.sol

pragma solidity ^0.8.0;

/**
 * The ability to disable locks has been removed on v10 to decrease contract code size.
 * Disabling locks can be achieved by setting `setMaxNumberOfKeys` to `totalSupply`
 * and expire all existing keys.
 * @dev the variables are kept to prevent conflicts in storage layout during upgrades
 */
contract MixinDisable {
  bool isAlive;
  uint256[1000] private __safe_upgrade_gap;
}


// File @openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol@v4.6.0

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
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {AccessControl-_setupRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

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


// File @openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol@v4.6.0

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
    function __Context_init() internal onlyInitializing {
    }

    function __Context_init_unchained() internal onlyInitializing {
    }
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


// File @openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol@v4.6.0

// OpenZeppelin Contracts v4.4.1 (utils/Strings.sol)

pragma solidity ^0.8.0;

/**
 * @dev String operations.
 */
library StringsUpgradeable {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
}


// File @openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol@v4.6.0

// OpenZeppelin Contracts (last updated v4.6.0) (access/AccessControl.sol)

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
 * ```
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```
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
 * accounts that have been granted it.
 */
abstract contract AccessControlUpgradeable is Initializable, ContextUpgradeable, IAccessControlUpgradeable, ERC165Upgradeable {
    function __AccessControl_init() internal onlyInitializing {
    }

    function __AccessControl_init_unchained() internal onlyInitializing {
    }
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
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControlUpgradeable).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
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
                        StringsUpgradeable.toHexString(uint160(account), 20),
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
    function getRoleAdmin(bytes32 role) public view virtual override returns (bytes32) {
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
     */
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
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
     */
    function revokeRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
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
     */
    function renounceRole(bytes32 role, address account) public virtual override {
        require(account == _msgSender(), "AccessControl: can only renounce roles for self");

        _revokeRole(role, account);
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event. Note that unlike {grantRole}, this function doesn't perform any
     * checks on the calling account.
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


// File contracts/mixins/MixinErrors.sol

pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
contract MixinErrors {
  
  // generic
  error OUT_OF_RANGE();
  error NULL_VALUE();
  error INVALID_ADDRESS();
  error INVALID_TOKEN();
  error INVALID_LENGTH();
  error UNAUTHORIZED();

  // erc 721
  error NON_COMPLIANT_ERC721_RECEIVER();

  // roles
  error ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
  error ONLY_KEY_MANAGER_OR_APPROVED();
  error UNAUTHORIZED_KEY_MANAGER_UPDATE();
  error ONLY_LOCK_MANAGER_OR_BENEFICIARY();
  error ONLY_LOCK_MANAGER();

  // single key status
  error KEY_NOT_VALID();
  error NO_SUCH_KEY();

  // single key operations
  error CANT_EXTEND_NON_EXPIRING_KEY();
  error NOT_ENOUGH_TIME();
  error NOT_ENOUGH_FUNDS();

  // migration & data schema
  error SCHEMA_VERSION_NOT_CORRECT();
  error MIGRATION_REQUIRED();

  // lock status/settings
  error OWNER_CANT_BE_ADDRESS_ZERO();
  error MAX_KEYS_REACHED();
  error KEY_TRANSFERS_DISABLED();
  error CANT_BE_SMALLER_THAN_SUPPLY();

  // transfers and approvals
  error TRANSFER_TO_SELF();
  error CANNOT_APPROVE_SELF();

  // keys management 
  error LOCK_SOLD_OUT();

  // purchase
  error INSUFFICIENT_ERC20_VALUE();
  error INSUFFICIENT_VALUE();

  // renewals
  error NON_RENEWABLE_LOCK();
  error LOCK_HAS_CHANGED();
  error NOT_READY_FOR_RENEWAL();

  // gas refund
  error GAS_REFUND_FAILED();

  // hooks
  // NB: `hookIndex` designed the index of hook address in the params of `setEventHooks`
  error INVALID_HOOK(uint8 hookIndex);

}


// File contracts/mixins/MixinRoles.sol

pragma solidity ^0.8.0;

// This contract mostly follows the pattern established by openzeppelin in
// openzeppelin/contracts-ethereum-package/contracts/access/roles


contract MixinRoles is AccessControlUpgradeable, MixinErrors {

  // roles
  bytes32 public constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER");
  bytes32 public constant KEY_GRANTER_ROLE = keccak256("KEY_GRANTER");

  // events
  event LockManagerAdded(address indexed account);
  event LockManagerRemoved(address indexed account);
  event KeyGranterAdded(address indexed account);
  event KeyGranterRemoved(address indexed account);

  // initializer
  function _initializeMixinRoles(address sender) internal {

    // for admin mamangers to add other lock admins
    _setRoleAdmin(LOCK_MANAGER_ROLE, LOCK_MANAGER_ROLE);

    // for lock managers to add/remove key granters
    _setRoleAdmin(KEY_GRANTER_ROLE, LOCK_MANAGER_ROLE);

    if (!isLockManager(sender)) {
      _setupRole(LOCK_MANAGER_ROLE, sender);  
    }
    if (!isKeyGranter(sender)) {
      _setupRole(KEY_GRANTER_ROLE, sender);
    }

  }

  // modifiers
  function _onlyLockManager() 
  internal 
  view
  {
    if(!hasRole(LOCK_MANAGER_ROLE, msg.sender)) {
      revert ONLY_LOCK_MANAGER();
    }
  }

  // lock manager functions
  function isLockManager(address account) public view returns (bool) {
    return hasRole(LOCK_MANAGER_ROLE, account);
  }

  function addLockManager(address account) public {
    _onlyLockManager();
    grantRole(LOCK_MANAGER_ROLE, account);
    emit LockManagerAdded(account);
  }

  function renounceLockManager() public {
    renounceRole(LOCK_MANAGER_ROLE, msg.sender);
    emit LockManagerRemoved(msg.sender);
  }


  // key granter functions
  function isKeyGranter(address account) public view returns (bool) {
    return hasRole(KEY_GRANTER_ROLE, account);
  }

  function addKeyGranter(address account) public {
    _onlyLockManager();
    grantRole(KEY_GRANTER_ROLE, account);
    emit KeyGranterAdded(account);
  }

  function revokeKeyGranter(address _granter) public {
    _onlyLockManager();
    revokeRole(KEY_GRANTER_ROLE, _granter);
    emit KeyGranterRemoved(_granter);
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/interfaces/IUnlock.sol

pragma solidity >=0.5.17 <0.9.0;


/**
 * @title The Unlock Interface
**/

interface IUnlock
{
  // Use initialize instead of a constructor to support proxies(for upgradeability via zos).
  function initialize(address _unlockOwner) external;

  /**
  * @dev deploy a ProxyAdmin contract used to upgrade locks
  */
  function initializeProxyAdmin() external;

  // store contract proxy admin address
  function proxyAdminAddress() external view;

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
  ) external returns(address);

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
  ) external returns(address);

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
  ) external returns(address);

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
  )
    external;

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
  )
    external;

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
  )
    external
    view
    returns(uint discount, uint tokens);

  // Function to read the globalTokenURI field.
  function globalBaseTokenURI()
    external
    view
    returns(string memory);

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
    returns(string memory);

  // Function to read the chainId field.
  function chainId()
    external
    view
    returns(uint);

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
  )
    external;

  /**
   * @notice Add a PublicLock template to be used for future calls to `createLock`.
   * @dev This is used to upgrade conytract per version number
   */
  function addLockTemplate(address impl, uint16 version) external;

  // match lock templates addresses with version numbers
  function publicLockImpls(uint16 _version) external view;
  
  // match version numbers with lock templates addresses 
  function publicLockVersions(address _impl) external view;

  // the latest existing lock template version
  function publicLockLatestVersion() external view;

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

  function grossNetworkProduct() external view returns(uint);

  function totalDiscountGranted() external view returns(uint);

  function locks(address) external view returns(bool deployed, uint totalSales, uint yieldedDiscountTokens);

  // The address of the public lock template, used when `createLock` is called
  function publicLockAddress() external view returns(address);

  // Map token address to exchange contract address if the token is supported
  // Used for GDP calculations
  function uniswapOracles(address) external view returns(address);

  // The WETH token address, used for value calculations
  function weth() external view returns(address);

  // The UDT token address, used to mint tokens on referral
  function udt() external view returns(address);

  // The approx amount of gas required to purchase a key
  function estimatedGasForPurchase() external view returns(uint);

  /**
   * Helper to get the network mining basefee as introduced in EIP-1559
   * @dev this helper can be wrapped in try/catch statement to avoid 
   * revert in networks where EIP-1559 is not implemented
   */
  function networkBaseFee() external view returns (uint);

  // The version number of the current Unlock implementation on this network
  function unlockVersion() external pure returns(uint16);

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
  function isOwner() external view returns(bool);

  /**
   * @dev Returns the address of the current owner.
   */
  function owner() external view returns(address);

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


// File @openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol@v4.6.0

// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20Upgradeable {
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
    function allowance(address owner, address spender) external view returns (uint256);

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


// File @openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol@v4.6.0

// OpenZeppelin Contracts v4.4.1 (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.0;


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20Upgradeable {
    using AddressUpgradeable for address;

    function safeTransfer(
        IERC20Upgradeable token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20Upgradeable token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20Upgradeable token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20Upgradeable token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20Upgradeable token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20Upgradeable token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}


// File contracts/mixins/MixinFunds.sol

pragma solidity ^0.8.0;




/**
 * @title An implementation of the money related functions.
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFunds is MixinErrors
{
  using AddressUpgradeable for address payable;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * The token-type that this Lock is priced in.  If 0, then use ETH, else this is
   * a ERC20 token address.
   */
  address public tokenAddress;

  function _initializeMixinFunds(
    address _tokenAddress
  ) internal
  {
    _isValidToken(_tokenAddress);
    tokenAddress = _tokenAddress;
  }

  function _isValidToken(
    address _tokenAddress
  ) 
  internal 
  view
  {
    if(
      _tokenAddress != address(0) 
      && 
      IERC20Upgradeable(_tokenAddress).totalSupply() < 0
    ) {
      revert INVALID_TOKEN();
    }
  }

  /**
   * Transfers funds from the contract to the account provided.
   *
   * Security: be wary of re-entrancy when calling this function.
   */
  function _transfer(
    address _tokenAddress,
    address payable _to,
    uint _amount
  ) internal
  {
    if(_amount > 0) {
      if(_tokenAddress == address(0)) {
        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        _to.sendValue(_amount);
      } else {
        IERC20Upgradeable token = IERC20Upgradeable(_tokenAddress);
        token.safeTransfer(_to, _amount);
      }
    }
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/interfaces/hooks/ILockKeyCancelHook.sol

pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a keyCancelHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyCancelHook
{
  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called with every key cancel.
   * @param operator the msg.sender issuing the cancel
   * @param to the account which had the key canceled
   * @param refund the amount sent to the `to` account (ETH or a ERC-20 token)
   */
  function onKeyCancel(
    address operator,
    address to,
    uint256 refund
  ) external;
}


// File contracts/interfaces/hooks/ILockKeyPurchaseHook.sol

pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a keyPurchaseHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyPurchaseHook
{
  /**
   * @notice Used to determine the purchase price before issueing a transaction.
   * This allows the hook to offer a discount on purchases.
   * This may revert to prevent a purchase.
   * @param from the msg.sender making the purchase
   * @param recipient the account which will be granted a key
   * @param referrer the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
   * @return minKeyPrice the minimum value/price required to purchase a key with these settings
   * @dev the lock's address is the `msg.sender` when this function is called via
   * the lock's `purchasePriceFor` function
   */
  function keyPurchasePrice(
    address from,
    address recipient,
    address referrer,
    bytes calldata data
  ) external view
    returns (uint minKeyPrice);

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called with every key sold.
   * @param from the msg.sender making the purchase
   * @param recipient the account which will be granted a key
   * @param referrer the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
   * @param minKeyPrice the price including any discount granted from calling this
   * hook's `keyPurchasePrice` function
   * @param pricePaid the value/pricePaid included with the purchase transaction
   * @dev the lock's address is the `msg.sender` when this function is called
   */
  function onKeyPurchase(
    address from,
    address recipient,
    address referrer,
    bytes calldata data,
    uint minKeyPrice,
    uint pricePaid
  ) external;
}


// File contracts/interfaces/hooks/ILockValidKeyHook.sol

pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a hasValidKey Hook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockValidKeyHook
{

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called every time balanceOf is called
   * @param lockAddress the address of the current lock
   * @param keyOwner the potential owner of the key for which we are retrieving the `balanceof`
   * @param expirationTimestamp the key expiration timestamp
   */
  function hasValidKey(
    address lockAddress,
    address keyOwner,
    uint256 expirationTimestamp,
    bool isValidKey
  ) 
  external view
  returns (bool);
}


// File contracts/interfaces/hooks/ILockTokenURIHook.sol

pragma solidity >=0.5.17 <0.9.0;

/**
 * @notice Functions to be implemented by a tokenURIHook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockTokenURIHook
{
  /**
   * @notice If the lock owner has registered an implementer
   * then this hook is called every time `tokenURI()` is called
   * @param lockAddress the address of the lock
   * @param operator the msg.sender issuing the call
   * @param owner the owner of the key for which we are retrieving the `tokenUri`
   * @param keyId the id (tokenId) of the key (if applicable)
   * @param expirationTimestamp the key expiration timestamp
   * @return the tokenURI
   */
  function tokenURI(
    address lockAddress,
    address operator,
    address owner,
    uint256 keyId,
    uint expirationTimestamp
  ) external view returns(string memory);
}


// File contracts/interfaces/hooks/ILockKeyTransferHook.sol

pragma solidity >=0.5.17 <0.9.0;


/**
 * @notice Functions to be implemented by a hasValidKey Hook.
 * @dev Lock hooks are configured by calling `setEventHooks` on the lock.
 */
interface ILockKeyTransferHook
{

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called every time balanceOf is called
   * @param lockAddress the address of the current lock
   * @param tokenId the Id of the transferred key 
   * @param operator who initiated the transfer
   * @param from the previous owner of transferred key 
   * @param from the previous owner of transferred key 
   * @param to the new owner of the key
   * @param expirationTimestamp the key expiration timestamp (after transfer)
   */
  function onKeyTransfer(
    address lockAddress,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint expirationTimestamp
  ) external;
}


// File contracts/mixins/MixinLockCore.sol

pragma solidity ^0.8.0;

// import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';











/**
 * @title Mixin for core lock data and functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockCore is
  MixinRoles,
  MixinFunds,
  MixinDisable
{
  using AddressUpgradeable for address;

  event Withdrawal(
    address indexed sender,
    address indexed tokenAddress,
    address indexed beneficiary,
    uint amount
  );

  event PricingChanged(
    uint oldKeyPrice,
    uint keyPrice,
    address oldTokenAddress,
    address tokenAddress
  );

   /**
    * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
    */
  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  /**
    * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
    */
  event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

  /**
    * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
    */
  event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

  // Unlock Protocol address
  // TODO: should we make that private/internal?
  IUnlock public unlockProtocol;

  // Duration in seconds for which the keys are valid, after creation
  // should we take a smaller type use less gas?
  uint public expirationDuration;

  // price in wei of the next key
  // TODO: allow support for a keyPriceCalculator which could set prices dynamically
  uint public keyPrice;

  // Max number of keys sold if the keyReleaseMechanism is public
  uint public maxNumberOfKeys;

  // A count of how many new key purchases there have been
  uint internal _totalSupply;

  // The account which will receive funds on withdrawal
  address payable public beneficiary;

  // The denominator component for values specified in basis points.
  uint internal constant BASIS_POINTS_DEN = 10000;

  // lock hooks
  ILockKeyPurchaseHook public onKeyPurchaseHook;
  ILockKeyCancelHook public onKeyCancelHook;
  ILockValidKeyHook public onValidKeyHook;
  ILockTokenURIHook public onTokenURIHook;

  // use to check data version (added to v10)
  uint public schemaVersion;

  // keep track of how many key a single address can use (added to v10)
  uint internal _maxKeysPerAddress;

  // one more hook (added to v11)
  ILockKeyTransferHook public onKeyTransferHook;

  // modifier to check if data has been upgraded
  function _lockIsUpToDate() internal view {
    if(schemaVersion != publicLockVersion()) {
      revert MIGRATION_REQUIRED();
    }
  }

  // modifier
  function _onlyLockManagerOrBeneficiary() 
  internal 
  view
  {
    if(!isLockManager(msg.sender) && msg.sender != beneficiary) {
      revert ONLY_LOCK_MANAGER_OR_BENEFICIARY();
    }
  }
  
  function _initializeMixinLockCore(
    address payable _beneficiary,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  ) internal
  {
    unlockProtocol = IUnlock(msg.sender); // Make sure we link back to Unlock's smart contract.
    beneficiary = _beneficiary;
    expirationDuration = _expirationDuration;
    keyPrice = _keyPrice;
    maxNumberOfKeys = _maxNumberOfKeys;

    // update only when initialized
    schemaVersion = publicLockVersion();

    // only a single key per address is allowed by default
    _maxKeysPerAddress = 1;
  }

  // The version number of the current implementation on this network
  function publicLockVersion(
  ) public pure
    returns (uint16)
  {
    return 11;
  }

  /**
   * @dev Called by owner to withdraw all funds from the lock and send them to the `beneficiary`.
   * @param _tokenAddress specifies the token address to withdraw or 0 for ETH. This is usually
   * the same as `tokenAddress` in MixinFunds.
   * @param _amount specifies the max amount to withdraw, which may be reduced when
   * considering the available balance. Set to 0 or MAX_UINT to withdraw everything.
   */
  function withdraw(
    address _tokenAddress,
    uint _amount
  ) external
  {
    _onlyLockManagerOrBeneficiary();

    // get balance
    uint balance;
    if(_tokenAddress == address(0)) {
      balance = address(this).balance;
    } else {
      balance = IERC20Upgradeable(_tokenAddress).balanceOf(address(this));
    }

    uint amount;
    if(_amount == 0 || _amount > balance)
    {
      if(balance <= 0) {
        revert NOT_ENOUGH_FUNDS();
      }
      amount = balance;
    }
    else
    {
      amount = _amount;
    }

    emit Withdrawal(msg.sender, _tokenAddress, beneficiary, amount);
    // Security: re-entrancy not a risk as this is the last line of an external function
    _transfer(_tokenAddress, beneficiary, amount);
  }

  /**
   * A function which lets the owner of the lock change the pricing for future purchases.
   * This consists of 2 parts: The token address and the price in the given token.
   * In order to set the token to ETH, use 0 for the token Address.
   */
  function updateKeyPricing(
    uint _keyPrice,
    address _tokenAddress
  )
    external
  {
    _onlyLockManager();
    _isValidToken(_tokenAddress);
    uint oldKeyPrice = keyPrice;
    address oldTokenAddress = tokenAddress;
    keyPrice = _keyPrice;
    tokenAddress = _tokenAddress;
    emit PricingChanged(oldKeyPrice, keyPrice, oldTokenAddress, tokenAddress);
  }

  /**
   * A function which lets the owner of the lock update the beneficiary account,
   * which receives funds on withdrawal.
   */
  function updateBeneficiary(
    address payable _beneficiary
  ) external {
    _onlyLockManagerOrBeneficiary();
    if(_beneficiary == address(0)) {
      revert INVALID_ADDRESS();
    }
    beneficiary = _beneficiary;
  }

  /**
   * @notice Allows a lock manager to add or remove an event hook
   */
  function setEventHooks(
    address _onKeyPurchaseHook,
    address _onKeyCancelHook,
    address _onValidKeyHook,
    address _onTokenURIHook,
    address _onKeyTransferHook
  ) external
  {
    _onlyLockManager();

    if(_onKeyPurchaseHook != address(0) && !_onKeyPurchaseHook.isContract()) { revert INVALID_HOOK(0); }
    if(_onKeyCancelHook != address(0) && !_onKeyCancelHook.isContract()) { revert INVALID_HOOK(1); }
    if(_onValidKeyHook != address(0) && !_onValidKeyHook.isContract()) { revert INVALID_HOOK(2); }
    if(_onTokenURIHook != address(0) && !_onTokenURIHook.isContract()) { revert INVALID_HOOK(3); }
    if(_onKeyTransferHook != address(0) && !_onKeyTransferHook.isContract()) { revert INVALID_HOOK(4); }
    
    onKeyPurchaseHook = ILockKeyPurchaseHook(_onKeyPurchaseHook);
    onKeyCancelHook = ILockKeyCancelHook(_onKeyCancelHook);
    onTokenURIHook = ILockTokenURIHook(_onTokenURIHook);
    onValidKeyHook = ILockValidKeyHook(_onValidKeyHook);
    onKeyTransferHook = ILockKeyTransferHook(_onKeyTransferHook);
  }

  function totalSupply()
    public
    view returns(uint256)
  {
    return _totalSupply;
  }

  /**
   * @notice An ERC-20 style approval, allowing the spender to transfer funds directly from this lock.
   * @param _spender address that can spend tokens belonging to the lock
   * @param _amount amount of tokens that can be spent by the spender
   */
  function approveBeneficiary(
    address _spender,
    uint _amount
  ) public
    returns (bool)
  {
    _onlyLockManagerOrBeneficiary();
    return IERC20Upgradeable(tokenAddress).approve(_spender, _amount);
  }


  // decreased from 1000 to 998 when adding `schemaVersion` and `maxKeysPerAddress` in v10 
  // decreased from 998 to 997 when adding `onKeyTransferHook` in v11
  uint256[997] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinKeys.sol

pragma solidity ^0.8.0;


/**
 * @title Mixin for managing `Key` data, as well as the * Approval related functions needed to meet the ERC721
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinKeys is
  MixinErrors,
  MixinLockCore
{
  // The struct for a key
  struct Key {
    uint tokenId;
    uint expirationTimestamp;
  }

  // Emitted when the Lock owner expires a user's Key
  event ExpireKey(uint indexed tokenId);

  // Emitted when the expiration of a key is modified
  event ExpirationChanged(
    uint indexed _tokenId,
    uint _amount,
    bool _timeAdded
  );

  // fire when a key is extended
  event KeyExtended(
    uint indexed tokenId,
    uint newTimestamp
  );

  
  event KeyManagerChanged(uint indexed _tokenId, address indexed _newManager);

  event KeysMigrated(
    uint updatedRecordsCount
  );

  // Deprecated: don't use this anymore as we know enable multiple keys per owner.
  mapping (address => Key) internal keyByOwner;

  // Each tokenId can have at most exactly one owner at a time.
  // Returns address(0) if the token does not exist
  mapping (uint => address) internal _ownerOf;

  // Keep track of the total number of unique owners for this lock (both expired and valid).
  // This may be larger than totalSupply
  uint public numberOfOwners;

  // A given key has both an owner and a manager.
  // If keyManager == address(0) then the key owner is also the manager
  // Each key can have at most 1 keyManager.
  mapping (uint => address) public keyManagerOf;

  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transferred
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved address
  mapping (uint => address) internal approved;

  // Keeping track of approved operators for a given Key manager.
  // This approves a given operator for all keys managed by the calling "keyManager"
  // The caller may not currently be the keyManager for ANY keys.
  // These approvals are never reset/revoked automatically, unlike "approved",
  // which is reset on transfer.
  mapping (address => mapping (address => bool)) internal managerToOperatorApproved;

  // store all keys: tokenId => token
  mapping(uint256 => Key) internal _keys;
  
  // store ownership: owner => array of tokens owned by that owner
  mapping(address => mapping(uint256 => uint256)) private _ownedKeyIds;
  
  // store indexes: owner => list of tokenIds
  mapping(uint256 => uint256) private _ownedKeysIndex;

  // Mapping owner address to token count
  mapping(address => uint256) private _balances;
  
  /** 
   * Ensure that the caller is the keyManager of the key
   * or that the caller has been approved
   * for ownership of that key
   * @dev This is a modifier
   */ 
  function _onlyKeyManagerOrApproved(
    uint _tokenId
  )
  internal
  view
  {
    address realKeyOwner = keyManagerOf[_tokenId] == address(0) ? _ownerOf[_tokenId] : keyManagerOf[_tokenId];
    if(
      !_isKeyManager(_tokenId, msg.sender)
      && approved[_tokenId] != msg.sender
      && !isApprovedForAll(realKeyOwner, msg.sender)
    ) {
      revert ONLY_KEY_MANAGER_OR_APPROVED();
    }
  }

  /**
   * Check if a key is expired or not
   * @dev This is a modifier
   */
  function _isValidKey(
    uint _tokenId
  ) 
  internal
  view
  {
    if(!isValidKey(_tokenId)) {
      revert KEY_NOT_VALID();
    }
    
  }

  /**
   * Check if a key actually exists
   * @dev This is a modifier
   */
  function _isKey(
    uint _tokenId
  ) 
  internal
  view 
  {
    if(_keys[_tokenId].expirationTimestamp == 0) {
      revert NO_SUCH_KEY();
    }
  }

  /**
   * Deactivate an existing key
   * @param _tokenId the id of token to burn
   * @notice the key will be expired and ownership records will be destroyed
   */
  function burn(uint _tokenId) public {
    _isKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);

    emit Transfer(_ownerOf[_tokenId], address(0), _tokenId);

    // delete ownership and expire key
    _cancelKey(_tokenId);
  }

  /**
    * Migrate data from the previous single owner => key mapping to 
    * the new data structure w multiple tokens.
    * No data migration needed for v10 > v11
    */
  function migrate(bytes calldata) virtual public {
    schemaVersion = publicLockVersion();
  }

  /**
   * Set the schema version to the latest
   * @notice only lock manager call call this
   */
  function updateSchemaVersion() public {
    _onlyLockManager();
    schemaVersion = publicLockVersion();
  }

  /**
    * Returns the id of a key for a specific owner at a specific index
    * @notice Enumerate keys assigned to an owner
    * @dev Throws if `_index` >= `balanceOf(_keyOwner)` or if
    *  `_keyOwner` is the zero address, representing invalid keys.
    * @param _keyOwner address of the owner
    * @param _index position index in the array of all keys - less than `balanceOf(_keyOwner)`
    * @return The token identifier for the `_index`th key assigned to `_keyOwner`,
    *   (sort order not specified)
    * NB: name kept to be ERC721 compatible
    */
  function tokenOfOwnerByIndex(
    address _keyOwner,
    uint256 _index
  ) 
    public 
    view
    returns (uint256)
  {
      if(_index >= totalKeys(_keyOwner)) {
        revert OUT_OF_RANGE();
      }
      return _ownedKeyIds[_keyOwner][_index];
  }

  /**
   * Create a new key with a new tokenId and store it 
   * 
   */
  function _createNewKey(
    address _recipient,
    address _keyManager,
    uint expirationTimestamp
  ) 
  internal 
  returns (uint tokenId) {

    if(_recipient == address(0)) { 
        revert INVALID_ADDRESS();
    }
    
    // We increment the tokenId counter
    _totalSupply++;
    tokenId = _totalSupply;

    // create the key
    _keys[tokenId] = Key(tokenId, expirationTimestamp);
    
    // increase total number of unique owners
    if(totalKeys(_recipient) == 0 ) {
      numberOfOwners++;
    }

    // store ownership
    _createOwnershipRecord(tokenId, _recipient);

    // set key manager
    _setKeyManagerOf(tokenId, _keyManager);

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      tokenId
    );
  }

  function _extendKey(
    uint _tokenId,
    uint _duration
  ) internal 
    returns (
      uint newTimestamp
    )
  {
    uint expirationTimestamp = _keys[_tokenId].expirationTimestamp;

    // prevent extending a valid non-expiring key
    if(expirationTimestamp == type(uint).max){
      revert CANT_EXTEND_NON_EXPIRING_KEY();
    }
    
    // if non-expiring but not valid then extend
    uint duration = _duration == 0 ? expirationDuration : _duration;
    if(duration == type(uint).max) {
      newTimestamp = type(uint).max;
    } else {
      if (expirationTimestamp > block.timestamp) {
        // extends a valid key  
        newTimestamp = expirationTimestamp + duration;
      } else {
        // renew an expired or cancelled key
        newTimestamp = block.timestamp + duration;
      }
    }

    _keys[_tokenId].expirationTimestamp = newTimestamp;

    emit KeyExtended(_tokenId, newTimestamp);
  } 

  /**
   * Record ownership info and udpate balance for new owner
   * @param _tokenId the id of the token to cancel
   * @param _recipient the address of the new owner
   */
  function _createOwnershipRecord(
   uint _tokenId,
   address _recipient
  ) internal { 
    uint length = balanceOf(_recipient);
    
    // make sure address does not have more keys than allowed
    if(length >= _maxKeysPerAddress) {
      revert MAX_KEYS_REACHED();
    }

    // record new owner
    _ownedKeysIndex[_tokenId] = length;
    _ownedKeyIds[_recipient][length] = _tokenId;

    // update ownership mapping
    _ownerOf[_tokenId] = _recipient;
    _balances[_recipient] += 1;
  }

  /**
   * Merge existing keys
   * @param _tokenIdFrom the id of the token to substract time from
   * @param _tokenIdTo the id of the destination token  to add time
   * @param _amount the amount of time to transfer (in seconds)
   */
  function mergeKeys(
    uint _tokenIdFrom, 
    uint _tokenIdTo, 
    uint _amount
    ) public {

    // checks
    _isKey(_tokenIdFrom);
    _isValidKey(_tokenIdFrom);
    _onlyKeyManagerOrApproved(_tokenIdFrom);
    _isKey(_tokenIdTo);
    
    // make sure there is enough time remaining
    if(
      _amount > keyExpirationTimestampFor(_tokenIdFrom) - block.timestamp
    ) {
      revert NOT_ENOUGH_TIME();
    }

    // deduct time from parent key
    _timeMachine(_tokenIdFrom, _amount, false);

    // add time to destination key
    _timeMachine(_tokenIdTo, _amount, true);

  }

  /**
   * Delete ownership info and udpate balance for previous owner
   * @param _tokenId the id of the token to cancel
   */
  function _deleteOwnershipRecord(
    uint _tokenId
  ) internal {
    // get owner
    address previousOwner = _ownerOf[_tokenId];

    // delete previous ownership
    uint lastTokenIndex = balanceOf(previousOwner) - 1;
    uint index = _ownedKeysIndex[_tokenId];

    // When the token to delete is the last token, the swap operation is unnecessary
    if (index != lastTokenIndex) {
        uint256 lastTokenId = _ownedKeyIds[previousOwner][lastTokenIndex];
        _ownedKeyIds[previousOwner][index] = lastTokenId; // Move the last token to the slot of the to-delete token
        _ownedKeysIndex[lastTokenId] = index; // Update the moved token's index
    }

    // Deletes the contents at the last position of the array
    delete _ownedKeyIds[previousOwner][lastTokenIndex];

    // remove from owner count if thats the only key 
    if(totalKeys(previousOwner) == 1 ) {
      numberOfOwners--;
    }
    // update balance
    _balances[previousOwner] -= 1;
  }

  /**
   * Delete ownership info about a key and expire the key
   * @param _tokenId the id of the token to cancel
   * @notice this won't 'burn' the token, as it would still exist in the record
   */
  function _cancelKey(
    uint _tokenId
  ) internal {
    
    // Deletes the contents at the last position of the array
    _deleteOwnershipRecord(_tokenId);

    // expire the key
    _keys[_tokenId].expirationTimestamp = block.timestamp;

    // delete previous owner
    _ownerOf[_tokenId] = address(0);
  }

  /**
   * @return numberOfKeys The number of keys owned by `_keyOwner` (expired or not)
   */
  function totalKeys(
    address _keyOwner
  )
    public
    view
    returns (uint)
  {
    if(_keyOwner == address(0)) { 
      revert INVALID_ADDRESS();
    }

    return _balances[_keyOwner];
  }

  /**
   * In the specific case of a Lock, `balanceOf` returns only the tokens with a valid expiration timerange
   * @return balance The number of valid keys owned by `_keyOwner`
  */
  function balanceOf(
    address _keyOwner
  )
    public
    view
    returns (uint balance)
  {
    uint length = totalKeys(_keyOwner);
    for (uint i = 0; i < length; i++) {
      if(isValidKey(tokenOfOwnerByIndex(_keyOwner, i))) {
        balance++;
      }
    }
  }

  /**
   * Check if a certain key is valid
   * @param _tokenId the id of the key to check validity
   * @notice this makes use of the onValidKeyHook if it is set
   */
  function isValidKey(
    uint _tokenId
  )
    public
    view
    returns (bool)
  { 
    bool isValid = _keys[_tokenId].expirationTimestamp > block.timestamp;
    return isValid;
  }   

  /**
   * Checks if the user has at least one non-expired key.
   * @param _keyOwner the 
   */
  function getHasValidKey(
    address _keyOwner
  )
    public
    view
    returns (bool isValid)
  { 
    uint length = balanceOf(_keyOwner);
    if(length > 0) {
      for (uint i = 0; i < length; i++) {
        if(isValidKey(tokenOfOwnerByIndex(_keyOwner, i))) {
          return true; // stop looping at the first valid key
        }
      }
    }

    // use hook if it exists
    if(address(onValidKeyHook) != address(0)) {
      isValid = onValidKeyHook.hasValidKey(
        address(this),
        _keyOwner,
        0, // no timestamp needed (we use tokenId)
        isValid
      );
    }
    return isValid;   
  }

  /**
    * Returns the key's ExpirationTimestamp field for a given token.
    * @param _tokenId the tokenId of the key
    * @dev Returns 0 if the owner has never owned a key for this lock
    */
  function keyExpirationTimestampFor(
    uint _tokenId
  ) public view
    returns (uint)
  {
    return _keys[_tokenId].expirationTimestamp;
  }
 
  /** 
   *  Returns the owner of a given tokenId
   * @param _tokenId the id of the token
   * @return the address of the owner
   */ 
  function ownerOf(
    uint _tokenId
  ) public view
    returns(address)
  {
    return _ownerOf[_tokenId];
  }

  /**
   * @notice Public function for setting the manager for a given key
   * @param _tokenId The id of the key to assign rights for
   * @param _keyManager the address with the manager's rights for the given key.
   * Setting _keyManager to address(0) means the keyOwner is also the keyManager
   */
  function setKeyManagerOf(
    uint _tokenId,
    address _keyManager
  ) public
  {
    _isKey(_tokenId);
    if(
      // is already key manager
      !_isKeyManager(_tokenId, msg.sender) 
      // is lock manager
      && !isLockManager(msg.sender)
    ) {
      revert UNAUTHORIZED_KEY_MANAGER_UPDATE();
    }
    _setKeyManagerOf(_tokenId, _keyManager);
  }

  function _setKeyManagerOf(
    uint _tokenId,
    address _keyManager
  ) internal
  {
    if(keyManagerOf[_tokenId] != _keyManager) {
      keyManagerOf[_tokenId] = _keyManager;
      _clearApproval(_tokenId);
      emit KeyManagerChanged(_tokenId, _keyManager);
    }
  }

    /**
   * This approves _approved to get ownership of _tokenId.
   * Note: that since this is used for both purchase and transfer approvals
   * the approved token may not exist.
   */
  function approve(
    address _approved,
    uint _tokenId
  )
    public
  {
    _onlyKeyManagerOrApproved(_tokenId);
    if(msg.sender == _approved) {
      revert CANNOT_APPROVE_SELF();
    }

    approved[_tokenId] = _approved;
    emit Approval(_ownerOf[_tokenId], _approved, _tokenId);
  }

    /**
   * @notice Get the approved address for a single NFT
   * @dev Throws if `_tokenId` is not a valid NFT.
   * @param _tokenId The NFT to find the approved address for
   * @return The approved address for this NFT, or the zero address if there is none
   */
  function getApproved(
    uint _tokenId
  ) public view
    returns (address)
  {
    _isKey(_tokenId);
    address approvedRecipient = approved[_tokenId];
    return approvedRecipient;
  }

    /**
   * @dev Tells whether an operator is approved by a given keyManager
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  ) public view
    returns (bool)
  {
    return managerToOperatorApproved[_owner][_operator];
  }

  /**
   * Returns true if _keyManager is explicitly set as key manager, or if the 
   * address is the owner but no km is set.
   * identified by _tokenId
   */
  function _isKeyManager(
    uint _tokenId,
    address _keyManager
  ) internal view
    returns (bool)
  {
    if(
      // is explicitely a key manager
      keyManagerOf[_tokenId] == _keyManager 
      ||
      (
        // is owner and no key manager is set
        ownerOf(_tokenId) == _keyManager)
        && keyManagerOf[_tokenId] == address(0) 
      ) {
      return true;
    } else {
      return false;
    }
  }

  /**
    * @notice Modify the expirationTimestamp of a key
    * by a given amount.
    * @param _tokenId The ID of the key to modify.
    * @param _deltaT The amount of time in seconds by which
    * to modify the keys expirationTimestamp
    * @param _addTime Choose whether to increase or decrease
    * expirationTimestamp (false == decrease, true == increase)
    * @dev Throws if owner does not have a valid key.
    */
  function _timeMachine(
    uint _tokenId,
    uint256 _deltaT,
    bool _addTime
  ) internal
  {
    _isKey(_tokenId);

    uint formerTimestamp = _keys[_tokenId].expirationTimestamp;

    if(_addTime) {
      if(formerTimestamp > block.timestamp) {
        // append to valid key
        _keys[_tokenId].expirationTimestamp = formerTimestamp + _deltaT;
      } else {
        // add from now if key is expired
        _keys[_tokenId].expirationTimestamp = block.timestamp + _deltaT;
      }
    } else {
        _keys[_tokenId].expirationTimestamp = formerTimestamp - _deltaT;
    }

    emit ExpirationChanged(_tokenId, _deltaT, _addTime);
  }

  /**
   * @dev Function to clear current approval of a given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function _clearApproval(
    uint256 _tokenId
  ) internal
  {
    if (approved[_tokenId] != address(0)) {
      approved[_tokenId] = address(0);
    }
  }

  /**
   * @notice Change the maximum number of keys the lock can edit
   * @param _maxNumberOfKeys uint the maximum number of keys
   * @dev Can't be smaller than the existing supply
   */
  function setMaxNumberOfKeys (uint _maxNumberOfKeys) external {
     _onlyLockManager();
     if (_maxNumberOfKeys < _totalSupply) {
       revert CANT_BE_SMALLER_THAN_SUPPLY();
     }
     maxNumberOfKeys = _maxNumberOfKeys;
  }

  /**
   * A function to change the default duration of each key in the lock
   * @notice keys previously bought are unaffected by this change (i.e.
   * existing keys timestamps are not recalculated/updated)
   * @param _newExpirationDuration the new amount of time for each key purchased 
   * or type(uint).max for a non-expiring key
   */
  function setExpirationDuration(uint _newExpirationDuration) external {
     _onlyLockManager();
     expirationDuration = _newExpirationDuration;
  }
  
  /**
   * Set the maximum number of keys a specific address can use
   * @param _maxKeys the maximum amount of key a user can own
   */
  function setMaxKeysPerAddress(uint _maxKeys) external {
     _onlyLockManager();
     if(_maxKeys == 0) {
       revert NULL_VALUE();
     }
     _maxKeysPerAddress = _maxKeys;
  }

  /**
   * @return the maximum number of key allowed for a single address
   */
  function maxKeysPerAddress() external view returns (uint) {
    return _maxKeysPerAddress;
  }
  
  // decrease 1000 to 996 when adding new tokens/owners mappings in v10
  uint256[996] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinERC721Enumerable.sol

pragma solidity ^0.8.0;




/**
 * @title Implements the ERC-721 Enumerable extension.
 */
contract MixinERC721Enumerable is
  ERC165StorageUpgradeable,
  MixinErrors,
  MixinLockCore, // Implements totalSupply
  MixinKeys
{
  function _initializeMixinERC721Enumerable() internal
  {
    /**
     * register the supported interface to conform to ERC721Enumerable via ERC165
     * 0x780e9d63 ===
     *     bytes4(keccak256('totalSupply()')) ^
     *     bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
     *     bytes4(keccak256('tokenByIndex(uint256)'))
     */
    _registerInterface(0x780e9d63);
  }

  /// @notice Enumerate valid NFTs
  /// @dev Throws if `_index` >= `totalSupply()`.
  /// @param _index A counter less than `totalSupply()`
  /// @return The token identifier for the `_index`th NFT,
  ///  (sort order not specified)
  function tokenByIndex(
    uint256 _index
  ) public view
    returns (uint256)
  {
    if(_index >= _totalSupply) {
      revert OUT_OF_RANGE();
    }
    return _index;
  }

  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(
      AccessControlUpgradeable,
      ERC165StorageUpgradeable
    ) 
    returns (bool) 
    {
    return super.supportsInterface(interfaceId);
  }
  
  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinGrantKeys.sol

pragma solidity ^0.8.0;



/**
 * @title Mixin allowing the Lock owner to grant / gift keys to users.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinGrantKeys is
  MixinErrors,
  MixinRoles,
  MixinKeys
{
  /**
   * Allows the Lock owner to give a collection of users a key with no charge.
   * Each key may be assigned a different expiration date.
   */
  function grantKeys(
    address[] calldata _recipients,
    uint[] calldata _expirationTimestamps,
    address[] calldata _keyManagers
  ) external 
    returns (uint[] memory)
  {
    _lockIsUpToDate();
    if(!isKeyGranter(msg.sender) && !isLockManager(msg.sender)) {
      revert ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
    }

    uint[] memory tokenIds = new uint[](_recipients.length);
    for(uint i = 0; i < _recipients.length; i++) {
      // an event is triggered
      tokenIds[i] = _createNewKey(
        _recipients[i],
        _keyManagers[i],  
        _expirationTimestamps[i]
      ); 
    }
    return tokenIds;
  }
  
  /**
   * Allows the Lock owner or key granter to extend an existing keys with no charge. This is the "renewal" equivalent of `grantKeys`.
   * @param _tokenId The id of the token to extend
   * @param _duration The duration in secondes to add ot the key
   * @dev set `_duration` to 0 to use the default duration of the lock
   */
  function grantKeyExtension(uint _tokenId, uint _duration) external {
    _lockIsUpToDate();
    _isKey(_tokenId);
    if(!isKeyGranter(msg.sender) && !isLockManager(msg.sender)) {
      revert ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
    }
    _extendKey(_tokenId, _duration);
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/UnlockUtils.sol

pragma solidity >=0.5.17 <=0.8.13;

// This contract provides some utility methods for use with the unlock protocol smart contracts.
// Borrowed from:
// https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol#L943

library UnlockUtils {

  function strConcat(
    string memory _a,
    string memory _b,
    string memory _c,
    string memory _d
  ) internal pure
    returns (string memory _concatenatedString)
  {
    return string(abi.encodePacked(_a, _b, _c, _d));
  }

  function uint2Str(
    uint _i
  ) internal pure
    returns (string memory _uintAsString)
  {
    // make a copy of the param to avoid security/no-assign-params error
    uint c = _i;
    if (_i == 0) {
      return '0';
    }
    uint j = _i;
    uint len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len;
    while (c != 0) {
        k = k-1;
        uint8 temp = (48 + uint8(c - c / 10 * 10));
        bytes1 b1 = bytes1(temp);
        bstr[k] = b1;
        c /= 10;
    }
    return string(bstr);
  }

  function address2Str(
    address _addr
  ) internal pure
    returns(string memory)
  {
    bytes32 value = bytes32(uint256(uint160(_addr)));
    bytes memory alphabet = '0123456789abcdef';
    bytes memory str = new bytes(42);
    str[0] = '0';
    str[1] = 'x';
    for (uint i = 0; i < 20; i++) {
      str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
      str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
    }
    return string(str);
  }
}


// File contracts/mixins/MixinLockMetadata.sol

pragma solidity ^0.8.0;

// import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';




/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  ERC165StorageUpgradeable,
  MixinRoles,
  MixinLockCore,
  MixinKeys
{
  using UnlockUtils for uint;
  using UnlockUtils for address;
  using UnlockUtils for string;

  /// A descriptive name for a collection of NFTs in this contract.Defaults to "Unlock-Protocol" but is settable by lock owner
  string public name;

  /// An abbreviated name for NFTs in this contract. Defaults to "KEY" but is settable by lock owner
  string private lockSymbol;

  // the base Token URI for this Lock. If not set by lock owner, the global URI stored in Unlock is used.
  string private baseTokenURI;

  event NewLockSymbol(
    string symbol
  );

  function _initializeMixinLockMetadata(
    string calldata _lockName
  ) internal
  {
    ERC165StorageUpgradeable.__ERC165Storage_init();
    name = _lockName;
    // registering the optional erc721 metadata interface with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x5b5e139f);
  }

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   */
  function updateLockName(
    string calldata _lockName
  ) external
  {
    _onlyLockManager();
    name = _lockName;
  }

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   */
  function updateLockSymbol(
    string calldata _lockSymbol
  ) external
  {
    _onlyLockManager();
    lockSymbol = _lockSymbol;
    emit NewLockSymbol(_lockSymbol);
  }

  /**
    * @dev Gets the token symbol
    * @return string representing the token name
    */
  function symbol()
    external view
    returns(string memory)
  {
    if(bytes(lockSymbol).length == 0) {
      return unlockProtocol.globalTokenSymbol();
    } else {
      return lockSymbol;
    }
  }

  /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   */
  function setBaseTokenURI(
    string calldata _baseTokenURI
  ) external
  {
    _onlyLockManager();
    baseTokenURI = _baseTokenURI;
  }

  /**  @notice A distinct Uniform Resource Identifier (URI) for a given asset.
   * @param _tokenId The iD of the token  for which we want to retrieve the URI.
   * If 0 is passed here, we just return the appropriate baseTokenURI.
   * If a custom URI has been set we don't return the lock address.
   * It may be included in the custom baseTokenURI if needed.
   * @dev  URIs are defined in RFC 3986. The URI may point to a JSON file
   * that conforms to the "ERC721 Metadata JSON Schema".
   * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
   */
  function tokenURI(
    uint256 _tokenId
  ) external
    view
    returns(string memory)
  {
    string memory URI;
    string memory tokenId;
    string memory lockAddress = address(this).address2Str();
    string memory seperator;

    if(_tokenId != 0) {
      tokenId = _tokenId.uint2Str();
    } else {
      tokenId = '';
    }

    if(address(onTokenURIHook) != address(0))
    {
      uint expirationTimestamp = keyExpirationTimestampFor(_tokenId);
      return onTokenURIHook.tokenURI(
        address(this),
        msg.sender,
        ownerOf(_tokenId),
        _tokenId,
        expirationTimestamp
        );
    }

    if(bytes(baseTokenURI).length == 0) {
      URI = unlockProtocol.globalBaseTokenURI();
      seperator = '/';
    } else {
      URI = baseTokenURI;
      seperator = '';
      lockAddress = '';
    }

    return URI.strConcat(
        lockAddress,
        seperator,
        tokenId
      );
  }

  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(
      AccessControlUpgradeable,
      ERC165StorageUpgradeable
    ) 
    returns (bool) 
    {
    return super.supportsInterface(interfaceId);
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinPurchase.sol

pragma solidity ^0.8.0;





/**
 * @title Mixin for the purchase-related functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinPurchase is
  MixinErrors,
  MixinFunds,
  MixinDisable,
  MixinLockCore,
  MixinKeys
{
  event GasRefunded(address indexed receiver, uint refundedAmount, address tokenAddress);
  
  event UnlockCallFailed(address indexed lockAddress, address unlockAddress);

  // default to 0 
  uint256 internal _gasRefundValue;

  // Keep track of ERC20 price when purchased
  mapping(uint256 => uint256) internal _originalPrices;
  
  // Keep track of duration when purchased
  mapping(uint256 => uint256) internal _originalDurations;
  
  // keep track of token pricing when purchased
  mapping(uint256 => address) internal _originalTokens;

  mapping(address => uint) public referrerFees;

  /**
  * @dev Set the value/price to be refunded to the sender on purchase
  */

  function setGasRefundValue(uint256 _refundValue) external {
    _onlyLockManager();
    _gasRefundValue = _refundValue;
  }
  
  /**
  * @dev Returns value/price to be refunded to the sender on purchase
  */
  function gasRefundValue() external view returns (uint256 _refundValue) {
    return _gasRefundValue;
  }

  /**
  * Set a specific percentage of the keyPrice to be sent to the referrer while purchasing, 
  * extending or renewing a key. 
  * @param _referrer the address of the referrer. If set to the 0x address, any referrer will receive the fee.
  * @param _feeBasisPoint the percentage of the price to be used for this 
  * specific referrer (in basis points)
  * @dev To send a fixed percentage of the key price to all referrers, sett a percentage to `address(0)`
  */
  function setReferrerFee(address _referrer, uint _feeBasisPoint) public {
    _onlyLockManager();
    referrerFees[_referrer] = _feeBasisPoint;
  }

  /** 
  @dev internal function to execute the payments to referrers if any is set
  */
  function _payReferrer (address _referrer) internal {
    // get default value
    uint basisPointsToPay = referrerFees[address(0)];

    // get value for the referrer
    if(referrerFees[_referrer] != 0) {
      basisPointsToPay = referrerFees[_referrer];
    }
    
    // pay the referrer if necessary
    if (basisPointsToPay != 0) {
      _transfer(
        tokenAddress,
        payable(_referrer), 
        keyPrice * basisPointsToPay / BASIS_POINTS_DEN
      );
    }
  }

  /**
  * @dev Helper to communicate with Unlock (record GNP and mint UDT tokens)
  */
  function _recordKeyPurchase (uint _keyPrice, address _referrer) internal  {
    // make sure unlock is a contract, and we catch possible reverts
      if (address(unlockProtocol).code.length > 0) {
        // call Unlock contract to record GNP
        // the function is capped by gas to prevent running out of gas
        try unlockProtocol.recordKeyPurchase{gas: 300000}(_keyPrice, _referrer) 
        {} 
        catch {
          // emit missing unlock
          emit UnlockCallFailed(address(this), address(unlockProtocol));
        }
      } else {
        // emit missing unlock
        emit UnlockCallFailed(address(this), address(unlockProtocol));
      }
  }

  /**
  * @dev Purchase function
  * @param _values array of tokens amount to pay for this purchase >= the current keyPrice - any applicable discount
  * (_values is ignored when using ETH)
  * @param _recipients array of addresses of the recipients of the purchased key
  * @param _referrers array of addresses of the users making the referral
  * @param _keyManagers optional array of addresses to grant managing rights to a specific address on creation
  * @param _data arbitrary data populated by the front-end which initiated the sale
  * @notice when called for an existing and non-expired key, the `_keyManager` param will be ignored 
  * @dev Setting _value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the
  * price while my transaction is pending I can't be charged more than I expected (only applicable to ERC-20 when more
  * than keyPrice is approved for spending).
  */
  function purchase(
    uint256[] memory _values,
    address[] memory _recipients,
    address[] memory _referrers,
    address[] memory _keyManagers,
    bytes[] calldata _data
  ) external payable
    returns (uint[] memory)
  {
    _lockIsUpToDate();
    if(_totalSupply +  _recipients.length > maxNumberOfKeys) {
      revert LOCK_SOLD_OUT();
    }
    if(
      (_recipients.length != _referrers.length)
      ||
      (_recipients.length != _keyManagers.length)
      ) {
      revert INVALID_LENGTH();
    }

    uint totalPriceToPay;
    uint tokenId;
    uint[] memory tokenIds = new uint[](_recipients.length);

    for (uint256 i = 0; i < _recipients.length; i++) {
      // check recipient address
      address _recipient = _recipients[i];

      // check for a non-expiring key
      if (expirationDuration == type(uint).max) {
        // create a new key
        tokenId = _createNewKey(
          _recipient,
          _keyManagers[i],
          type(uint).max
        );
      } else {
        tokenId = _createNewKey(
          _recipient,
          _keyManagers[i],
          block.timestamp + expirationDuration
        );
      }

      // price
      uint inMemoryKeyPrice = purchasePriceFor(_recipient, _referrers[i], _data[i]);
      totalPriceToPay = totalPriceToPay + inMemoryKeyPrice;

      // store values at purchase time
      _originalPrices[tokenId] = inMemoryKeyPrice;
      _originalDurations[tokenId] = expirationDuration;
      _originalTokens[tokenId] = tokenAddress;

      // store tokenIds 
      tokenIds[i] = tokenId;
      
      if(tokenAddress != address(0) && _values[i] < inMemoryKeyPrice) {
        revert INSUFFICIENT_ERC20_VALUE();
      }

      // store in unlock
      _recordKeyPurchase(inMemoryKeyPrice, _referrers[i]);

      // fire hook
      uint pricePaid = tokenAddress == address(0) ? msg.value : _values[i];
      if(address(onKeyPurchaseHook) != address(0)) {
        onKeyPurchaseHook.onKeyPurchase(
          msg.sender, 
          _recipient, 
          _referrers[i], 
          _data[i], 
          inMemoryKeyPrice, 
          pricePaid
        );
      }
    }

    // transfer the ERC20 tokens
    if(tokenAddress != address(0)) {
      IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
      token.transferFrom(msg.sender, address(this), totalPriceToPay);
    } else if(msg.value < totalPriceToPay) {
      // We explicitly allow for greater amounts of ETH or tokens to allow 'donations'
      revert INSUFFICIENT_VALUE();
    }

    // refund gas
    _refundGas();

    // send what is due to referrers
    for (uint256 i = 0; i < _referrers.length; i++) { 
      _payReferrer(_referrers[i]);
    }

    return tokenIds;
  }

  /**
  * @dev Extend function
  * @param _value the number of tokens to pay for this purchase >= the current keyPrice - any applicable discount
  * (_value is ignored when using ETH)
  * @param _tokenId id of the key to extend
  * @param _referrer address of the user making the referral
  * @param _data arbitrary data populated by the front-end which initiated the sale
  * @dev Throws if lock is disabled or key does not exist for _recipient. Throws if _recipient == address(0).
  */
  function extend(
    uint _value,
    uint _tokenId,
    address _referrer,
    bytes calldata _data
  ) 
    public 
    payable
  {
    _lockIsUpToDate();
    _isKey(_tokenId);

    // extend key duration
    _extendKey(_tokenId, 0);

    // transfer the tokens
    uint inMemoryKeyPrice = purchasePriceFor(ownerOf(_tokenId), _referrer, _data);

    // process in unlock
    _recordKeyPurchase(inMemoryKeyPrice, _referrer);

    if(tokenAddress != address(0)) {
      if(_value < inMemoryKeyPrice) {
        revert INSUFFICIENT_ERC20_VALUE();
      }
      IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
      token.transferFrom(msg.sender, address(this), inMemoryKeyPrice);
    } else if(msg.value < inMemoryKeyPrice) {
      // We explicitly allow for greater amounts of ETH or tokens to allow 'donations'
      revert INSUFFICIENT_VALUE();
    }

    // if params have changed, then update them
    if(_originalPrices[_tokenId] != inMemoryKeyPrice) {
      _originalPrices[_tokenId] = inMemoryKeyPrice;
    }
    if(_originalDurations[_tokenId] != expirationDuration) {
      _originalDurations[_tokenId] = expirationDuration;
    }
    if(_originalTokens[_tokenId] != tokenAddress) {
      _originalTokens[_tokenId] = tokenAddress;
    }

    // refund gas (if applicable)
    _refundGas();

    // send what is due to referrer
    _payReferrer(_referrer);
  }

  /**
  * Renew a given token
  * @notice only works for non-free, expiring, ERC20 locks
  * @param _tokenId the ID fo the token to renew
  * @param _referrer the address of the person to be granted UDT
  */
  function renewMembershipFor(
    uint _tokenId,
    address _referrer
  ) public {
    _lockIsUpToDate();
    _isKey(_tokenId);

    // check the lock
    if(_originalDurations[_tokenId] == type(uint).max || tokenAddress == address(0)) {
      revert NON_RENEWABLE_LOCK();
    }

    // make sure duration and pricing havent changed  
    uint keyPrice = purchasePriceFor(ownerOf(_tokenId), _referrer, '');
    if(
      _originalPrices[_tokenId] != keyPrice
      ||
      _originalDurations[_tokenId] != expirationDuration
      || 
      _originalTokens[_tokenId] != tokenAddress
    ) {
      revert LOCK_HAS_CHANGED();
    }

    // make sure key is ready for renewal
    if(isValidKey(_tokenId)) {
      revert NOT_READY_FOR_RENEWAL();
    }

    // extend key duration
    _extendKey(_tokenId, 0);

    // store in unlock
    _recordKeyPurchase(keyPrice, _referrer);

    // transfer the tokens
    IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
    token.transferFrom(ownerOf(_tokenId), address(this), keyPrice);

    // refund gas if applicable
    _refundGas();

    // send what is due to referrer
    _payReferrer(_referrer);
  }

  /**
   * @notice returns the minimum price paid for a purchase with these params.
   * @dev minKeyPrice considers any discount from Unlock or the OnKeyPurchase hook
   */
  function purchasePriceFor(
    address _recipient,
    address _referrer,
    bytes memory _data
  ) public view
    returns (uint minKeyPrice)
  {
    if(address(onKeyPurchaseHook) != address(0))
    {
      minKeyPrice = onKeyPurchaseHook.keyPurchasePrice(msg.sender, _recipient, _referrer, _data);
    }
    else
    {
      minKeyPrice = keyPrice;
    }
  }

  /**
   * Refund the specified gas amount and emit an event
   * @notice this does sth only if `_gasRefundValue` is non-null
   */
  function _refundGas() internal {
    if (_gasRefundValue != 0) { 
      if(tokenAddress != address(0)) {
        IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
        // send tokens to refun gas
        token.transfer(msg.sender, _gasRefundValue);
      } else {
        (bool success, ) = msg.sender.call{value: _gasRefundValue}("");
        if(!success) {
          revert GAS_REFUND_FAILED();
        }
      }
      emit GasRefunded(msg.sender, _gasRefundValue, tokenAddress);
    }
  }

  // decreased from 1000 to 997 when added mappings for initial purchases pricing and duration on v10 
  // decreased from 997 to 996 when added the `referrerFees` mapping on v11
  uint256[996] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinRefunds.sol

pragma solidity ^0.8.0;





contract MixinRefunds is
  MixinRoles,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinPurchase
{
  // CancelAndRefund will return funds based on time remaining minus this penalty.
  // This is calculated as `proRatedRefund * refundPenaltyBasisPoints / BASIS_POINTS_DEN`.
  uint public refundPenaltyBasisPoints;

  uint public freeTrialLength;

  event CancelKey(
    uint indexed tokenId,
    address indexed owner,
    address indexed sendTo,
    uint refund
  );

  event RefundPenaltyChanged(
    uint freeTrialLength,
    uint refundPenaltyBasisPoints
  );

  function _initializeMixinRefunds() internal
  {
    // default to 10%
    refundPenaltyBasisPoints = 1000;
  }

  /**
   * @dev Invoked by the lock owner to destroy the user's key and perform a refund and cancellation
   * of the key
   * @param _tokenId The id of the key to expire
   * @param _amount The amount to refund
   */
  function expireAndRefundFor(
    uint _tokenId,
    uint _amount
  ) external {
    _isKey(_tokenId);
    _isValidKey(_tokenId);
    _onlyLockManager();
    _cancelAndRefund(_tokenId, _amount);
  }

  /**
   * @dev Destroys the key and sends a refund based on the amount of time remaining.
   * @param _tokenId The id of the key to cancel.
   */
  function cancelAndRefund(uint _tokenId)
    external
  {
    _isKey(_tokenId);
    _isValidKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);
    uint refund = getCancelAndRefundValue(_tokenId);
    _cancelAndRefund(_tokenId, refund);
  }

  /**
   * Allow the owner to change the refund penalty.
   */
  function updateRefundPenalty(
    uint _freeTrialLength,
    uint _refundPenaltyBasisPoints
  ) external {
    _onlyLockManager();
    emit RefundPenaltyChanged(
      _freeTrialLength,
      _refundPenaltyBasisPoints
    );

    freeTrialLength = _freeTrialLength;
    refundPenaltyBasisPoints = _refundPenaltyBasisPoints;
  }

  /**
   * @dev cancels the key for the given keyOwner and sends the refund to the msg.sender.
   * @notice this deletes ownership info and expire the key, but doesnt 'burn' it
   */
  function _cancelAndRefund(
    uint _tokenId,
    uint refund
  ) internal
  {
    address payable keyOwner = payable(ownerOf(_tokenId));
    
    // delete ownership info and expire the key
    _cancelKey(_tokenId);
    
    // emit event
    emit CancelKey(_tokenId, keyOwner, msg.sender, refund);
    
    if (refund > 0) {
      _transfer(tokenAddress, keyOwner, refund);
    }

    // make future reccuring transactions impossible
    _originalDurations[_tokenId] = 0;
    _originalPrices[_tokenId] = 0;
    
    // inform the hook if there is one registered
    if(address(onKeyCancelHook) != address(0))
    {
      onKeyCancelHook.onKeyCancel(msg.sender, keyOwner, refund);
    }
  }

  /**
   * @dev Determines how much of a refund a key would be worth if a cancelAndRefund
   * is issued now.
   * @param _tokenId the key to check the refund value for.
   * @notice due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValue(
    uint _tokenId
  )
    public view
    returns (uint refund)
  {
    _isValidKey(_tokenId);

    // return entire purchased price if key is non-expiring
    if(expirationDuration == type(uint).max) {
      return keyPrice;
    }

    // substract free trial value
    uint timeRemaining = keyExpirationTimestampFor(_tokenId) - block.timestamp;
    if(timeRemaining + freeTrialLength >= expirationDuration) {
      refund = keyPrice;
    } else {
      refund = keyPrice * timeRemaining / expirationDuration;
    }

    // Apply the penalty if this is not a free trial
    if(freeTrialLength == 0 || timeRemaining + freeTrialLength < expirationDuration)
    {
      uint penalty = keyPrice * refundPenaltyBasisPoints / BASIS_POINTS_DEN;
      if (refund > penalty) {
        refund -= penalty;
      } else {
        refund = 0;
      }
    }
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File @openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol@v4.6.0

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


// File contracts/mixins/MixinTransfer.sol

pragma solidity ^0.8.0;









/**
 * @title Mixin for the transfer-related functions needed to meet the ERC721
 * standard.
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is
  MixinErrors,
  MixinRoles,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinPurchase
{
  using AddressUpgradeable for address;

  event TransferFeeChanged(
    uint transferFeeBasisPoints
  );

  // 0x150b7a02 == bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

  // The fee relative to keyPrice to charge when transfering a Key to another account
  // (potentially on a 0x marketplace).
  // This is calculated as `keyPrice * transferFeeBasisPoints / BASIS_POINTS_DEN`.
  uint public transferFeeBasisPoints;

  /**
  * @notice Allows the key owner to safely transfer a portion of the remaining time 
  * from their key to a new key
  * @param _tokenIdFrom the key to share
  * @param _to The recipient of the shared time
  * @param _timeShared The amount of time shared
  */
  function shareKey(
    address _to,
    uint _tokenIdFrom,
    uint _timeShared
  ) public
  {
    _lockIsUpToDate();
    if(maxNumberOfKeys <= _totalSupply) {
      revert LOCK_SOLD_OUT();
    }
    _onlyKeyManagerOrApproved(_tokenIdFrom);
    _isValidKey(_tokenIdFrom);
    if(transferFeeBasisPoints >= BASIS_POINTS_DEN) {
      revert KEY_TRANSFERS_DISABLED();
    }

    address keyOwner = _ownerOf[_tokenIdFrom];

    // store time to be added
    uint time;

    // get the remaining time for the origin key
    uint timeRemaining = keyExpirationTimestampFor(_tokenIdFrom) - block.timestamp;

    // get the transfer fee based on amount of time wanted share
    uint fee = getTransferFee(_tokenIdFrom, _timeShared);
    uint timePlusFee = _timeShared + fee;

    // ensure that we don't try to share too much
    if(timePlusFee < timeRemaining) {
      // now we can safely set the time
      time = _timeShared;
      // deduct time from parent key, including transfer fee
      _timeMachine(_tokenIdFrom, timePlusFee, false);
    } else {
      // we have to recalculate the fee here
      fee = getTransferFee(_tokenIdFrom, timeRemaining);
      time = timeRemaining - fee;
      _keys[_tokenIdFrom].expirationTimestamp = block.timestamp; // Effectively expiring the key
      emit ExpireKey(_tokenIdFrom);
    }

    // create new key
    uint tokenIdTo = _createNewKey(
      _to,
      address(0),
      block.timestamp + time
    );
    
    // trigger event
    emit Transfer(
      keyOwner,
      _to,
      tokenIdTo
    );

    if(!_checkOnERC721Received(keyOwner, _to, tokenIdTo, '')) {
      revert NON_COMPLIANT_ERC721_RECEIVER();
    }
  }

  /** 
  * An ERC721-like function to transfer a token from one account to another. 
  * @param _from the owner of token to transfer
  * @param _recipient the address that will receive the token
  * @param _tokenId the id of the token
  * @dev Requirements: if the caller is not `from`, it must be approved to move this token by
  * either {approve} or {setApprovalForAll}. 
  * The key manager will be reset to address zero after the transfer
  */
  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
  {
    _isValidKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);
    
    // reset key manager to address zero
    keyManagerOf[_tokenId] = address(0);

    _transferFrom(_from, _recipient, _tokenId);
  }

  /** 
  * Lending a key allows you to transfer the token while retaining the 
  * ownerships right by setting yourself as a key manager first. 
  * @param _from the owner of token to transfer
  * @param _recipient the address that will receive the token
  * @param _tokenId the id of the token
  * @notice This function can only called by 1) the key owner when no key manager is set or 2) the key manager.
  * After calling the function, the `_recipient` will be the new owner, and the sender of the tx
  * will become the key manager.
  */
  function lendKey(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
  {
    // make sure caller is either owner or key manager 
    if(!_isKeyManager(_tokenId, msg.sender)) {
      revert UNAUTHORIZED();
    }
    
    // transfer key ownership to lender
    _transferFrom(_from, _recipient, _tokenId);

    // set key owner as key manager
    keyManagerOf[_tokenId] = msg.sender;
  }

  /** 
  * Unlend is called when you have lent a key and want to claim its full ownership back. 
  * @param _recipient the address that will receive the token ownership
  * @param _tokenId the id of the token
  * @dev Only the key manager of the token can call this function
  */
  function unlendKey(
    address _recipient,
    uint _tokenId
  ) public {
    _isValidKey(_tokenId);

    if(msg.sender != keyManagerOf[_tokenId]) {
      revert UNAUTHORIZED();
    }
    _transferFrom(ownerOf(_tokenId), _recipient, _tokenId);
  }

  /**
   * This functions contains the logic to transfer a token
   * from an account to another
   */
  function _transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  ) private {

    _isValidKey(_tokenId);

    // incorrect _from field
    if (ownerOf(_tokenId) != _from) {
      revert UNAUTHORIZED();
    }

    if(transferFeeBasisPoints >= BASIS_POINTS_DEN) {
      revert KEY_TRANSFERS_DISABLED();
    }
    if(_recipient == address(0)) {
      revert INVALID_ADDRESS();
    }
    if(_from == _recipient) {
      revert TRANSFER_TO_SELF();
    }


    // subtract the fee from the senders key before the transfer
    _timeMachine(_tokenId, getTransferFee(_tokenId, 0), false);  

    // transfer a token
    Key storage key = _keys[_tokenId];

    // update expiration
    key.expirationTimestamp = keyExpirationTimestampFor(_tokenId);

    // increase total number of unique owners
    if(balanceOf(_recipient) == 0 ) {
      numberOfOwners++;
    }

    // delete token from previous owner
    _deleteOwnershipRecord(_tokenId);
    
    // record new owner
    _createOwnershipRecord(_tokenId, _recipient);

    // clear any previous approvals
    _clearApproval(_tokenId);

    // make future reccuring transactions impossible
    _originalDurations[_tokenId] = 0;
    _originalPrices[_tokenId] = 0;

    // trigger event
    emit Transfer(
      _from,
      _recipient,
      _tokenId
    );

    // fire hook if it exists
    if(address(onKeyTransferHook) != address(0)) {
      onKeyTransferHook.onKeyTransfer(
        address(this),
        _tokenId,
        msg.sender, // operator
        _from,
        _recipient,
        key.expirationTimestamp
      );
    }
  }

  /**
   * @notice An ERC-20 style transfer.
   * @param _tokenId the Id of the token to send
   * @param _to the destination address
   * @param _valueBasisPoint a percentage (expressed as basis points) of the time to be transferred
   * @return success bool success/failure of the transfer
   */
  function transfer(
    uint _tokenId,
    address _to,
    uint _valueBasisPoint
  ) public
    returns (bool success)
  {
    _isValidKey(_tokenId);
    uint timeShared = ( keyExpirationTimestampFor(_tokenId) - block.timestamp ) * _valueBasisPoint / BASIS_POINTS_DEN;
    shareKey( _to, _tokenId, timeShared);
    return true;
  }

  /**
  * @notice Transfers the ownership of an NFT from one address to another address
  * @dev This works identically to the other function with an extra data parameter,
  *  except this function just sets data to ''
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId
  )
    public
  {
    safeTransferFrom(_from, _to, _tokenId, '');
  }

   /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   * @notice disabled when transfers are disabled
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) public
  {
    if(_to == msg.sender) {
      revert CANNOT_APPROVE_SELF();
    }
    if(transferFeeBasisPoints >= BASIS_POINTS_DEN) {
      revert KEY_TRANSFERS_DISABLED();
    }
    managerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
  }

  /**
  * @notice Transfers the ownership of an NFT from one address to another address.
  * When transfer is complete, this functions
  *  checks if `_to` is a smart contract (code size > 0). If so, it calls
  *  `onERC721Received` on `_to` and throws if the return value is not
  *  `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`.
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  * @param _data Additional data with no specified format, sent in call to `_to`
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId,
    bytes memory _data
  )
    public
  {
    transferFrom(_from, _to, _tokenId);
    if(!_checkOnERC721Received(_from, _to, _tokenId, _data)) {
      revert NON_COMPLIANT_ERC721_RECEIVER();
    }
  }

  /**
   * Allow the Lock owner to change the transfer fee.
   */
  function updateTransferFee(
    uint _transferFeeBasisPoints
  ) external {
    _onlyLockManager();
    emit TransferFeeChanged(
      _transferFeeBasisPoints
    );
    transferFeeBasisPoints = _transferFeeBasisPoints;
  }

  /**
   * Determines how much of a fee would need to be paid in order to
   * transfer to another account.  This is pro-rated so the fee goes 
   * down overtime.
   * @dev Throws if _tokenId is not have a valid key
   * @param _tokenId The id of the key check the transfer fee for.
   * @param _time The amount of time to calculate the fee for.
   * @return The transfer fee in seconds.
   */
  function getTransferFee(
    uint _tokenId,
    uint _time
  )
    public view
    returns (uint)
  {
    _isKey(_tokenId);
    uint expirationTimestamp = keyExpirationTimestampFor(_tokenId);
    if(expirationTimestamp < block.timestamp) {
      return 0;
    } else {
      uint timeToTransfer;
      if(_time == 0) {
        timeToTransfer = expirationTimestamp - block.timestamp;
      } else {
        timeToTransfer = _time;
      }
      return timeToTransfer * transferFeeBasisPoints / BASIS_POINTS_DEN;
    }
  }

  /**
   * @dev Internal function to invoke `onERC721Received` on a target address
   * The call is not executed if the target address is not a contract
   * @param from address representing the previous owner of the given token ID
   * @param to target address that will receive the tokens
   * @param tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return whether the call correctly returned the expected magic value
   */
  function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  )
    internal
    returns (bool)
  {
    if (!to.isContract()) {
      return true;
    }
    bytes4 retval = IERC721ReceiverUpgradeable(to).onERC721Received(
      msg.sender, from, tokenId, _data);
    return (retval == _ERC721_RECEIVED);
  }

  uint256[1000] private __safe_upgrade_gap;
}


// File contracts/mixins/MixinConvenienceOwnable.sol

pragma solidity ^0.8.0;


/**
 * @title Mixin to add support for `ownable()`
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinConvenienceOwnable is MixinErrors, MixinLockCore {

  // used for `owner()`convenience helper
  address private _convenienceOwner;

  // events
  event OwnershipTransferred(address previousOwner, address newOwner);

  function _initializeMixinConvenienceOwnable(address _sender) internal {
    _convenienceOwner = _sender;
  }

  /** `owner()` is provided as an helper to mimick the `Ownable` contract ABI.
    * The `Ownable` logic is used by many 3rd party services to determine
    * contract ownership - e.g. who is allowed to edit metadata on Opensea.
    * 
    * @notice This logic is NOT used internally by the Unlock Protocol and is made 
    * available only as a convenience helper.
   */
  function owner() public view returns (address) {
    return _convenienceOwner;
  }

  /** Setter for the `owner` convenience helper (see `owner()` docstring for more).
    * @notice This logic is NOT used internally by the Unlock Protocol ans is made 
    * available only as a convenience helper.
    * @param account address returned by the `owner()` helper
   */ 
  function setOwner(address account) public {
    _onlyLockManager();
    if(account == address(0)) {
      revert OWNER_CANT_BE_ADDRESS_ZERO(); 
    }
    address _previousOwner = _convenienceOwner;
    _convenienceOwner = account;
    emit OwnershipTransferred(_previousOwner, account);
  }

  function isOwner(address account) public view returns (bool) {
    return _convenienceOwner == account;
  }

  uint256[1000] private __safe_upgrade_gap;

}


// File contracts/PublicLock.sol

pragma solidity ^0.8.13;














/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://eips.ethereum.org/EIPS/eip-721
 */
contract PublicLock is
  Initializable,
  ERC165StorageUpgradeable,
  MixinRoles,
  MixinFunds,
  MixinDisable,
  MixinLockCore,
  MixinKeys,
  MixinLockMetadata,
  MixinERC721Enumerable,
  MixinGrantKeys,
  MixinPurchase,
  MixinTransfer,
  MixinRefunds,
  MixinConvenienceOwnable
{
  function initialize(
    address payable _lockCreator,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string calldata _lockName
  ) public
    initializer()
  {
    MixinFunds._initializeMixinFunds(_tokenAddress);
    MixinLockCore._initializeMixinLockCore(_lockCreator, _expirationDuration, _keyPrice, _maxNumberOfKeys);
    MixinLockMetadata._initializeMixinLockMetadata(_lockName);
    MixinERC721Enumerable._initializeMixinERC721Enumerable();
    MixinRefunds._initializeMixinRefunds();
    MixinRoles._initializeMixinRoles(_lockCreator);
    MixinConvenienceOwnable._initializeMixinConvenienceOwnable(_lockCreator);
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
  }

  /**
   * @notice Allow the contract to accept tips in ETH sent directly to the contract.
   * @dev This is okay to use even if the lock is priced in ERC-20 tokens
   */
  receive() external payable {}
  
  /**
   Overrides
  */
  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(
      MixinERC721Enumerable,
      MixinLockMetadata,
      AccessControlUpgradeable, 
      ERC165StorageUpgradeable
    ) 
    returns (bool) 
    {
    return super.supportsInterface(interfaceId);
  }

}
