pragma solidity ^0.8.15;

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPublicLock.sol";
import "../interfaces/bridge/IWETH.sol";
import "hardhat/console.sol";

contract UnlockBridgeReceiver is IXReceiver {

  IWETH weth;
  constructor(address _weth) {
    weth = IWETH(_weth);
  }

  /** @notice The receiver function as required by the IXReceiver interface.
   * @dev The Connext bridge contract will call this function.
   */
  function xReceive(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address originSender,
    uint32 origin,
    bytes memory callData
  ) external returns (bytes memory) {
    console.log("--- arrived in the other side of the bridge");

    // 0 if is erc20
    uint valueToSend;

    // unpack lock address and calldata
    address payable lockAddress;
    bytes memory lockCalldata;
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));

    if(currency != address(0)) {
      // approve tokens to spend
      IERC20 token = IERC20(currency);
      require(token.balanceOf(address(this)) >= amount, 'not enough');
      token.approve(lockAddress, amount);
    } else {
      // unwrap native tokens
      valueToSend = amount;
      require(valueToSend <= weth.balanceOf(address(this)), 'INSUFFICIENT_BALANCE');
      weth.withdraw(valueToSend);
      require(valueToSend <= address(this).balance, 'INSUFFICIENT_BALANCE');
    }

    (bool success, ) = lockAddress.call{value: valueToSend}(lockCalldata);
    // catch revert reason
    if (success == false) {
      assembly {
          let ptr := mload(0x40)
          let size := returndatasize()
          returndatacopy(ptr, 0, size)
          revert(ptr, size)
      }
    }
  }

  // required as WETH withdraw will unwrap and send tokens here 
  receive() external payable {}
}