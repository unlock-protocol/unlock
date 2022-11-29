pragma solidity ^0.8.15;

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPublicLock.sol";
import "hardhat/console.sol";

contract UnlockBridgeReceiver is IXReceiver {



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

    // TODO: remove that 
    // unpack lock address and calldata
    address payable lockAddress;
    bytes memory lockCalldata;
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));

    // approve spent tokens
    IERC20 token = IERC20(currency);
    require(token.balanceOf(address(this)) >= amount, 'not enough');
    token.approve(lockAddress, amount);

    (bool success, ) = lockAddress.call(lockCalldata);
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
}