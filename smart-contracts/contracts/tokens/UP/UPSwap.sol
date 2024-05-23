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
  error UpAlreadySet();

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

  function initialize(address _udt, address initialOwner) public initializer {
    __Ownable_init(initialOwner);

    // store addresses
    udt = IERC20(_udt);
  }

  function setUp(address _up) public {
    if (address(up) != address(0)) {
      revert UpAlreadySet();
    }
    up = IERC20(_up);
  }

  function swapUDTForUP(
    address spender,
    uint amountUDT,
    address recipient
  ) public {
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

    emit UDTSwappedForUP(spender, amountUDT, amountUP, recipient);
  }

  function swapUPForUDT(
    address spender,
    uint amountUP,
    address recipient
  ) public {
    // check contract UDT balance
    uint amountUDT = amountUP / RATE;
    if (udt.balanceOf(address(this)) < amountUDT) {
      revert BalanceTooLow(address(udt), address(this), amountUDT);
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

    emit UPSwappedForUDT(spender, amountUDT, amountUP, recipient);
  }
}
