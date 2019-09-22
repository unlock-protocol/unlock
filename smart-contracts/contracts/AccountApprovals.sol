pragma solidity 0.5.11;

import 'openzeppelin-eth/contracts/access/roles/WhitelistedRole.sol';


contract AccountApprovals is
  WhitelistedRole
{
  mapping(address => bytes) public accountData;

  event Approve(address operator, address account, bytes data);

  function approve(
    address _account,
    bytes calldata _data
  ) external
    onlyWhitelisted
  {
    accountData[_account] = _data;
    emit Approve(msg.sender, _account, _data);
  }
}
