pragma solidity ^0.8.0;

import '@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';


contract MinterRoleUpgradeable is Initializable, ContextUpgradeable {
    using Roles for Roles.Role;

    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

    Roles.Role private _minters;

    function initialize(address sender) public virtual initializer {
        if (!isMinter(sender)) {
            _addMinter(sender);
        }
    }

    modifier onlyMinter() {
        require(isMinter(_msgSender()), "MinterRole: caller does not have the Minter role");
        _;
    }

    function isMinter(address account) public view returns (bool) {
        return _minters.has(account);
    }

    function addMinter(address account) public onlyMinter {
        _addMinter(account);
    }

    function renounceMinter() public {
        _removeMinter(_msgSender());
    }

    function _addMinter(address account) internal {
        _minters.add(account);
        emit MinterAdded(account);
    }

    function _removeMinter(address account) internal {
        _minters.remove(account);
        emit MinterRemoved(account);
    }

    uint256[50] private ______gap;
}

abstract contract ERC20DetailedUpgradeable is Initializable, IERC20Upgradeable {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    function initialize(string memory name, string memory symbol, uint8 decimals) public virtual initializer {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    uint256[50] private ______gap;
}

abstract contract ERC20MintableUpgradeable is Initializable, ERC20Upgradeable, MinterRoleUpgradeable {
    function initialize(address sender) public virtual override initializer {
        MinterRoleUpgradeable.initialize(sender);
    }

    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }

    uint256[50] private ______gap;
}

/**
* @title The Unlock Discount Token
* This smart contract implements the Unlock Discount Token
*/
contract UnlockDiscountTokenV2 is
ERC20MintableUpgradeable,
ERC20DetailedUpgradeable
{
    /**
    * @notice A one-time call to configure the token.
    * @param _minter A wallet with permissions to mint tokens and/or add other minters.
    */
    function initialize(address _minter) public override initializer()
    {
        ERC20MintableUpgradeable.initialize(_minter);
        ERC20DetailedUpgradeable.initialize('Unlock Discount Token', 'UDT', 18);
    }

    function name() public view override(IERC20MetadataUpgradeable, ERC20DetailedUpgradeable) returns (string memory) {
        return ERC20DetailedUpgradeable.name();
    }

    function symbol() public view override(IERC20MetadataUpgradeable, ERC20DetailedUpgradeable) returns (string memory) {
        return ERC20DetailedUpgradeable.symbol();
    }

    function decimals() public view override(ERC20Upgradeable, ERC20DetailedUpgradeable) returns (uint8) {
        return ERC20DetailedUpgradeable.decimals();
    }
}
