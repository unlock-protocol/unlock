// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

contract UnlockProtocolToken is
  Initializable,
  ERC20Upgradeable,
  ERC20PermitUpgradeable,
  OwnableUpgradeable
{
  uint public constant TOTAL_SUPPLY = 1_000_000_000;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address initialOwner,
    address preMinter
  ) public initializer {
    __ERC20_init("UnlockProtocolToken", "UP");
    __ERC20Permit_init("UnlockProtocolToken");
    __Ownable_init(initialOwner);

    // premint the supply
    _mint(preMinter, TOTAL_SUPPLY * 10 ** decimals());
  }
}
