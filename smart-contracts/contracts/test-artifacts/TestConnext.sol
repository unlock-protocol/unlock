// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import 'hardhat/console.sol';

contract TestConnext  {

  address public receiver;

  constructor(
    address _receiver
  ) {
    receiver = _receiver;
  }

  function xcall(
    uint32 _destination, 
    address _to, 
    address _asset, 
    address _delegate, 
    uint256 _amount, 
    uint256 _slippage, 
    bytes calldata _callData
  ) external payable returns (bytes32 transferId) {

    console.log('---- arrived in xcall');
    console.log(_destination);
    console.log(_to);
    console.log(_asset);
    console.log(_delegate);
    console.log(_amount);
    console.log(_slippage);
    console.logBytes(_callData);
    
    uint32 origin = uint32(31337);
    transferId = bytes32(block.timestamp);
    IXReceiver(receiver).xReceive(
      transferId,
      _amount, // amount of token in wei
      _asset, // the ERC20 token
      address(0), // _originSender
      origin, // domain ID of the origin chain
      _callData
    );
  }
}