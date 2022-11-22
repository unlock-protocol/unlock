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
    address asset,
    address originSender,
    uint32 origin,
    bytes memory callData
  ) external returns (bytes memory) {
    console.log("call received");

    // unpack lock address and calldata
    console.logBytes(callData);
    
    address payable lockAddress;
    console.log(lockAddress);

    bytes memory lockCalldata;
    console.logBytes(lockCalldata);
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));

    lockAddress.call{value: amount}(lockCalldata);
  }
}