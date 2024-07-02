// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

contract UPSwap is Initializable, OwnableUpgradeable {
  // 1 UDT for 1000 UP
  uint public constant RATE = 1000;

  // tokens
  IERC20 public up;
  IERC20 public udt;

  // errors
  error BalanceTooLow(
    address tokenAddress,
    address account,
    uint expectedAmount
  );
  error TransferFailed(address tokenAddress);
  error InvalidSpender();

  // events
  event UPSwappedForUDT(
    address spender,
    uint amountUDT,
    uint amountUP,
    address recipient
  );
  event UDTSwappedForUP(
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
    address _udt,
    address _up,
    address initialOwner
  ) public initializer {
    __Ownable_init(initialOwner);

    // store UDT address
    udt = IERC20(_udt);
    up = IERC20(_up);
  }

  function setUp(address _up) public onlyOwner {
    up = IERC20(_up);
  }

  function swapUDTForUP(uint amountUDT, address recipient) public {
    // get the UDT from spender
    bool UDTSent = udt.transferFrom(msg.sender, address(this), amountUDT);
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

    emit UDTSwappedForUP(msg.sender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDT(uint amountUP, address recipient) public {
    // check contract UDT balance
    uint amountUDT = amountUP / RATE;
    if (udt.balanceOf(address(this)) < amountUDT) {
      revert BalanceTooLow(address(udt), address(this), amountUDT);
    }

    // get UP token from spender
    bool UPSent = up.transferFrom(msg.sender, address(this), amountUP);
    if (!UPSent) {
      revert TransferFailed(address(up));
    }

    // send the UDT to recipient
    bool UDTSent = udt.transfer(recipient, amountUDT);
    if (!UDTSent) {
      revert TransferFailed(address(udt));
    }

    emit UPSwappedForUDT(msg.sender, amountUDT, amountUP, recipient);
  }
}
