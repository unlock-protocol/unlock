// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

contract UPSwap is Initializable, OwnableUpgradeable {
  address public up;
  address public udt;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address _up,
    address _udt,
    address initialOwner
  ) public initializer {
    __Ownable_init(initialOwner);

    // store addresses
    up = _up;
    udt = _udt;
  }

  function swapUDTForUP(
    address sender,
    uint amount,
    address recipient
  ) public {}

  function swapUPforUDT(
    address sender,
    uint amount,
    address recipient
  ) public {}

  function swapUPForUDTWithSignature(
    address sender,
    uint amount,
    address recipient,
    bytes calldata signature
  ) public {}
}
