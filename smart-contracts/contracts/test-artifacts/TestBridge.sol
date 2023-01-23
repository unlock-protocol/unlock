// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "../interfaces/IWETH.sol";


contract TestBridge {
  
  IWETH weth;
  
  // used to know here does the call come from
  uint32 srcDomainId; 

  // used for swap
  address srcToken;
  address destToken;

  constructor(
    address _weth, 
    uint32 _srcDomainId,
    address _srcToken,
    address _destToken
  ) {
    weth = IWETH(_weth);
    srcDomainId = _srcDomainId;
    srcToken = _srcToken;
    destToken = _destToken;
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
    transferId = bytes32(block.timestamp);

    // wrap native assets
    if (_asset == address(0)) {
      weth.deposit{value: _amount}();
      bool success = weth.transfer(_to, _amount);
      require(success, "wrapping token failed");
    } else {
      // get asset from the src lock
      IERC20(srcToken).transferFrom(msg.sender, address(this), _amount);

      // make sure we got the $$
      require(
        IERC20(srcToken).balanceOf(address(this)) >= _amount,
        'not enough token'
      );

      // SWAP using a (fake) bridged token
      IERC20(destToken).transfer(_to, _amount);
    }

    // cross the bridge
    IXReceiver(_to).xReceive(
      transferId,
      _amount, // amount of token in wei
      _asset == address(0) ? address(0) : address(destToken), // native or bridged ERC20 token
      msg.sender, // sender on the origin chain
      srcDomainId, // domain ID of the origin chain
      _callData
    );
  }
}
