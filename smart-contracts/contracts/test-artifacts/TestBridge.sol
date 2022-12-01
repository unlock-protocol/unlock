// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import "hardhat/console.sol";
import "../interfaces/IWETH.sol";

contract TestBridge {
  IWETH weth;
  uint32 srcDomainId; // used to know here does the call come from

  constructor(address _weth, uint32 _srcDomainId) {
    console.log(_weth);
    weth = IWETH(_weth);
    srcDomainId = _srcDomainId;
  }

  /**
   * Mock Connext with a basic function that receives xcall
   * and send it to a IXReceiver contract
   */
  function xcall(
    uint32 _destination, // domainID
    address _to,
    address _asset,
    address _delegate,
    uint256 _amount,
    uint256 _slippage,
    bytes calldata _callData
  ) external payable returns (bytes32 transferId) {
    console.log("---- arrived in bridge");
    uint valueToSend = _amount;
    transferId = bytes32(block.timestamp);

    // wrap native assets
    if (_asset == address(0)) {
      weth.deposit{value: _amount}();
      bool success = weth.transfer(_to, _amount);
      require(success, "wrapping token failed");
    }

    console.log("---- crossed the bridge with id:", uint(transferId));

    IXReceiver(_to).xReceive(
      transferId,
      _amount, // amount of token in wei
      _asset, // the ERC20 token
      msg.sender, // sender on the origin chain
      srcDomainId, // domain ID of the origin chain
      _callData
    );
  }
}
