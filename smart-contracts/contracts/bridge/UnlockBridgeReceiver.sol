pragma solidity ^0.8.15;

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPublicLock.sol";
import "hardhat/console.sol";

contract UnlockBridgeReceiver is IXReceiver {

  // modifier onlyUnlockBridge(address _originSender, uint32 _origin) {
  //   require(
  //     _origin == <ORIGIN_DOMAIN> &&
  //       _originSender == <SOURCE_CONTRACT_ADDRESS> &&
  //       msg.sender == <CONNEXT_CONTRACT_ADDRESS>,
  //     "Expected source contract on origin domain called by Connext"
  //   );
  //   _;
  // }

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
    console.log("--- arrived in the other side of the bridge");

    // unpack lock address and calldata
    console.logBytes(callData);
    
    address payable lockAddress;
    bytes memory lockCalldata;
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));
    console.log(lockAddress);
    console.logBytes(lockCalldata);

    (bool success, bytes memory result) = lockAddress.call{value: amount}(lockCalldata);
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