// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";
import {IAllowanceTransfer} from "../../interfaces/IAllowanceTransfer.sol";

contract UPSwap is Initializable, OwnableUpgradeable {
  // 1 UDT for 100 UP
  uint public constant RATE = 1000;

  // tokens
  IERC20 public up;
  IERC20 public udt;
  IAllowanceTransfer public PERMIT2;

  // errors
  error AllowanceTooLow();
  error BalanceTooLow(
    address tokenAddress,
    address account,
    uint expectedAmount
  );
  error TransferFailed(address tokenAddress);
  error SwapPaused();
  error InvalidSpender();

  // events
  event UPSwapped(
    address spender,
    uint amountUDT,
    uint amountUP,
    address recipient
  );
  event UDTSwapped(
    address spender,
    uint amountUDT,
    uint amountUP,
    address recipient
  );

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address _up,
    address _udt,
    IAllowanceTransfer permit2,
    address initialOwner
  ) public initializer {
    __Ownable_init(initialOwner);

    // store addresses
    up = IERC20(_up);
    udt = IERC20(_udt);

    PERMIT2 = permit2;
  }

  function swapUDTForUP(
    address spender,
    uint amountUDT,
    address recipient
  ) public {
    // check balance
    if (udt.balanceOf(spender) < amountUDT) {
      revert BalanceTooLow(address(udt), spender, amountUDT);
    }

    // check allowance
    if (udt.allowance(spender, address(this)) < amountUDT) {
      revert AllowanceTooLow();
    }

    // get the UDT from spender
    bool UDTSent = udt.transferFrom(spender, address(this), amountUDT);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    // 1 UDT for 1,000 UP tokens
    uint amountUP = amountUDT * RATE;

    // send UP token to recipient
    bool UPSent = up.transfer(recipient, amountUP);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    emit UDTSwapped(spender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDT(
    address spender,
    uint amountUP,
    address recipient
  ) public {
    // check balance
    if (up.balanceOf(spender) < amountUP) {
      revert BalanceTooLow(address(up), spender, amountUP);
    }

    // check contract UDT balance
    uint amountUDT = amountUP / RATE;
    if (udt.balanceOf(address(this)) < amountUDT) {
      revert BalanceTooLow(address(udt), address(this), amountUDT);
    }

    // check allowance
    if (up.allowance(spender, address(this)) < amountUP) {
      revert AllowanceTooLow();
    }

    // get UP token from spender
    bool UPSent = up.transferFrom(spender, address(this), amountUP);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    // send the UDT to recipient
    bool UDTSent = udt.transfer(recipient, amountUDT);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    emit UPSwapped(spender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDTWithSignature(
    address spender,
    uint160 amountUP,
    address recipient,
    IAllowanceTransfer.PermitSingle calldata permitSingle,
    bytes calldata signature
  ) public {
    // transfer UP token
    if (permitSingle.spender != address(this)) revert InvalidSpender();
    PERMIT2.permit(spender, permitSingle, signature);
    PERMIT2.transferFrom(
      spender,
      address(this),
      amountUP,
      permitSingle.details.token
    );

    // send the UDT to recipient
    uint amountUDT = amountUP / RATE;

    bool UDTSent = udt.transfer(recipient, amountUDT);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }
    emit UPSwapped(spender, amountUDT, amountUP, recipient);
  }
}
