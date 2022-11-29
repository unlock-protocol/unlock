// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import "hardhat/console.sol";
import "../interfaces/bridge/IWETH.sol";

contract TestBridge {
  IWETH weth;

  constructor(address _weth) {
    console.log(_weth);
    weth = IWETH(_weth);
  }

  /**
   * Mock Connext with a basic function that receives xcall
   * and send it to a IXReceiver contract
   */
  function xcall(
    uint32 _destination,
    address _to,
    address _asset,
    address _delegate,
    uint256 _amount,
    uint256 _slippage,
    bytes calldata _callData
  ) external payable returns (bytes32 transferId) {
    console.log("---- arrived in bridge");
    uint valueToSend = _amount;
    uint32 origin = uint32(31337);
    transferId = bytes32(block.timestamp);

    // wrap native assets
    if (_asset == address(0)) {
      weth.deposit{value: _amount}();
      console.log(weth.balanceOf(address(this)));
      bool success = weth.transfer(_to, _amount);
      require(success, "wrapping token failed");
    }

    console.log("---- crossed the bridge with id:");
    console.log(uint(transferId));

    IXReceiver(_to).xReceive(
      transferId,
      _amount, // amount of token in wei
      _asset, // the ERC20 token
      address(0), // _originSender
      origin, // domain ID of the origin chain
      _callData
    );
  }
}
