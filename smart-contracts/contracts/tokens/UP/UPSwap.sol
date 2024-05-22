// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

contract UPSwap is Initializable, OwnableUpgradeable {
  IERC20 public up;
  IERC20 public udt;

  error AllowanceTooLow();
  error BalanceTooLow();
  error TransferFailed(address tokenAddress);

  event UPSwapped(address sender, uint amount, address recipient);
  event UDTSwapped(address sender, uint amount, address recipient);

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
    up = IERC20(_up);
    udt = IERC20(_udt);
  }

  function swapUDTForUP(address sender, uint amount, address recipient) public {
    // check balance
    if (udt.balanceOf(sender) < amount) {
      revert BalanceTooLow();
    }

    // check allowance
    if (udt.allowance(sender, address(this)) < amount) {
      revert AllowanceTooLow();
    }

    // get the UDT from sender
    bool UDTSent = udt.transferFrom(sender, address(this), amount);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    // send UP token to recipient
    bool UPSent = up.transfer(recipient, amount);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    emit UDTSwapped(sender, amount, recipient);
  }

  function swapUPforUDT(address sender, uint amount, address recipient) public {
    // check balance
    if (up.balanceOf(sender) < amount) {
      revert BalanceTooLow();
    }

    // check allowance
    if (up.allowance(sender, address(this)) < amount) {
      revert AllowanceTooLow();
    }

    // get UP token from sender
    bool UPSent = up.transferFrom(sender, address(this), amount);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    // send the UDT to recipient
    bool UDTSent = udt.transfer(recipient, amount);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    emit UPSwapped(sender, amount, recipient);
  }

  function swapUPForUDTWithSignature(
    address sender,
    uint amount,
    address recipient,
    bytes calldata signature
  ) public {}
}
