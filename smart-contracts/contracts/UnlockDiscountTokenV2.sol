// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ERC20Patched.sol';

/**
* @title The Unlock Discount Token
* This smart contract implements the Unlock Discount Token
*/
contract UnlockDiscountTokenV2 is
ERC20MintableUpgradeable,
ERC20DetailedUpgradeable,
ERC20VotesCompUpgradeable
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

  function _mint(address account, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20VotesUpgradeable) {
    return ERC20VotesUpgradeable._mint(account, amount);
  }

  function _burn(address account, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20VotesUpgradeable) {
    return ERC20VotesUpgradeable._burn(account, amount);
  }

  function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20Upgradeable, ERC20VotesUpgradeable) {
    return ERC20VotesUpgradeable._afterTokenTransfer(from, to, amount);
  }

  function burn(address account, uint256 amount) public {
    // _burn(account, amount);
  }
}
