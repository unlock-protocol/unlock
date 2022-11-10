// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../mixins/LockRoles.sol';

contract ExternalRefund is LockRoles
{
  IPublicLockV8 public lock;
  mapping(address => bool) public refundee;
  uint256 public refundAmount;
  IERC20 public baseToken;

  event Refund(
    address indexed _recipient,
    IERC20 indexed _token,
    uint _amount
  );

  constructor(IPublicLockV8 _lockAddress, uint256 _refundAmount, IERC20 _token)
  {
    lock = _lockAddress;
    refundAmount = _refundAmount;
    baseToken = _token;
  }

  function refund(address recipient) public onlyLockManager(lock)
  {
    require(!refundee[recipient], 'Recipient has already been refunded');
    require(lock.getHasValidKey(recipient), 'Recipient does not own a key');

    refundee[recipient] = true;
    baseToken.transfer(recipient, refundAmount);
    emit Refund(recipient, baseToken, refundAmount);
  }

  function drain() public onlyLockManager(lock)
  {
    uint256 balance = baseToken.balanceOf(address(this));
    baseToken.transfer(msg.sender, balance);
  }
}

