pragma solidity ^0.8.15;

/**
 * TODO: this code needs to be merge into the `PublicLock` contract
 * once its ready (and we made enough space there)
 */

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPublicLock.sol";
import "../interfaces/bridge/IWETH.sol";
import "hardhat/console.sol";

contract UnlockBridgeReceiver is IXReceiver {
  event BridgeCall(address indexed lockAddress, bytes32 transferId);

  IWETH weth;

  constructor(address _weth) {
    weth = IWETH(_weth);
  }

  // TODO: store unlock contracts address on all other chains
  function _onlyUnlockBridge(
    address _originSender,
    uint32 _origin
  ) internal view returns (bool) {
    // require(
    //   _origin == _originDOMAIN> &&
    //     _originSender == <SOURCE_CONTRACT_ADDRESS> &&
    //     msg.sender == <CONNEXT_CONTRACT_ADDRESS>,
    //   "Expected source contract on origin domain called by Connext"
    // );
    return true;
  }

  /** @notice The receiver function as required by the IXReceiver interface.
   * @dev The Connext bridge contract will call this function.
   */
  function xReceive(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address originSender, // address of the contract on the origin chain
    uint32 origin, // 	Domain ID of the origin chain
    bytes memory callData
  ) external returns (bytes memory) {
    _onlyUnlockBridge(originSender, origin);

    // 0 if is erc20
    uint valueToSend;

    // unpack lock address and calldata
    address payable lockAddress;
    bytes memory lockCalldata;
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));

    if (currency != address(0)) {
      // approve tokens to spend
      IERC20 token = IERC20(currency);
      require(token.balanceOf(address(this)) >= amount, "not enough");
      token.approve(lockAddress, amount);
    } else {
      // unwrap native tokens
      valueToSend = amount;
      require(
        valueToSend <= weth.balanceOf(address(this)),
        "INSUFFICIENT_BALANCE"
      );
      weth.withdraw(valueToSend);
      require(valueToSend <= address(this).balance, "INSUFFICIENT_BALANCE");
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

    emit BridgeCall(lockAddress, transferId);
  }

  // required as WETH withdraw will unwrap and send tokens here
  receive() external payable {}
}
