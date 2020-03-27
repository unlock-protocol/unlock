pragma solidity ^0.5.0;

import 'unlock-abi-7/IPublicLockV7.sol';
import '@openzeppelin/contracts/access/roles/WhitelistedRole.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract ExternalRefund is WhitelistedRole
{
  IPublicLockV7 public lock;
  mapping(address => bool) public refundee;
  uint256 public refundAmount;
  IERC20 public baseToken;

  event Refund(
    address indexed _recipient,
    IERC20 indexed _token,
    uint _amount
  );

  constructor(IPublicLockV7 _lockAddress, uint256 _refundAmount, IERC20 _token) public
  {
    lock = _lockAddress;
    refundAmount = _refundAmount;
    baseToken = _token;
  }

  function refund(address recipient) public onlyWhitelisted()
  {
    require(!refundee[recipient], 'Recipient has already been refunded');
    require(lock.getHasValidKey(recipient), 'Recipient does not own a key');

    refundee[recipient] = true;
    baseToken.transfer(recipient, refundAmount);
    emit Refund(recipient, baseToken, refundAmount);
  }

  function drain() public onlyWhitelistAdmin()
  {
    uint256 balance = baseToken.balanceOf(address(this));
    baseToken.transfer(msg.sender, balance);
  }
}

