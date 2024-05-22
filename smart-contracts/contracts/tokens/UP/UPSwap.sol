// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

contract UPSwap is Initializable, OwnableUpgradeable {
  // 1 UDT for 100 UP
  uint public constant RATE = 1000;

  // pause swap if necessary
  bool public swapIsPaused;

  // tokens
  IERC20 public up;
  IERC20 public udt;

  // errors
  error AllowanceTooLow();
  error BalanceTooLow(
    address tokenAddress,
    address account,
    uint expectedAmount
  );
  error TransferFailed(address tokenAddress);
  error SwapPaused();

  // events
  event UPSwapped(
    address sender,
    uint amountUDT,
    uint amountUP,
    address recipient
  );
  event UDTSwapped(
    address sender,
    uint amountUDT,
    uint amountUP,
    address recipient
  );

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  modifier swapIsOn() {
    if (swapIsPaused) {
      revert SwapPaused();
    }
    _;
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

    // swap enable by default
    swapIsPaused = false;
  }

  function swapUDTForUP(
    address sender,
    uint amountUDT,
    address recipient
  ) public swapIsOn {
    // check balance
    if (udt.balanceOf(sender) < amountUDT) {
      revert BalanceTooLow(address(udt), sender, amountUDT);
    }

    // check allowance
    if (udt.allowance(sender, address(this)) < amountUDT) {
      revert AllowanceTooLow();
    }

    // get the UDT from sender
    bool UDTSent = udt.transferFrom(sender, address(this), amountUDT);
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

    emit UDTSwapped(sender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDT(
    address sender,
    uint amountUP,
    address recipient
  ) public swapIsOn {
    // check balance
    if (up.balanceOf(sender) < amountUP) {
      revert BalanceTooLow(address(up), sender, amountUP);
    }

    // check contract UDT balance
    uint amountUDT = amountUP / RATE;
    if (udt.balanceOf(address(this)) < amountUDT) {
      revert BalanceTooLow(address(udt), address(this), amountUDT);
    }

    // check allowance
    if (up.allowance(sender, address(this)) < amountUP) {
      revert AllowanceTooLow();
    }

    // get UP token from sender
    bool UPSent = up.transferFrom(sender, address(this), amountUP);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    // send the UDT to recipient
    bool UDTSent = udt.transfer(recipient, amountUDT);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    emit UPSwapped(sender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDTWithSignature(
    address sender,
    uint amount,
    address recipient,
    bytes calldata signature
  ) public {}

  function pauseSwap(bool _swapIsPaused) public onlyOwner {
    swapIsPaused = _swapIsPaused;
  }
}
