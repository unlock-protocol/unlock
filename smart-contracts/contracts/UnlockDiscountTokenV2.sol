// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ERC20Patched.sol';

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
