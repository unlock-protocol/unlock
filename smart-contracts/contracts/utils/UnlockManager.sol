// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * UnlockManager receives and send instructions from bridges 
 * to Unlock contracts deployed on various chains. It triggers upgrades
 * and settings, following orders coming from mainnet.
 */


import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import '../interfaces/IUnlock.sol';

contract UnlockManager {

  address public bridgeAddress;
  address public unlockAddress;
  address public dispatcherAddress;
  uint32 public domain;

  // Errors
  error OnlyUnlock();
  error ChainNotSet();
  error LengthMismatch();
  error Unauthorized(address sender);
  error InsufficientApproval(uint requiredAmount);
  error InsufficientBalance();

  event BridgeCallReceived(
    bytes32 transferId,
    uint8 action,      
    address indexed contractCalled, 
    bytes execCallData
  );

   /**
   * @param _bridgeAddress address of connext contract on current chain
   * @param _unlockAddress address of the Unlock contract on current chain
   * @param _domain the Domain ID of the current chain as used by the Connext Bridge 
   * https://docs.connext.network/resources/supported-chains
   */
  constructor (
    address _bridgeAddress,
    address _dispatcherAddress,
    address _unlockAddress,
    uint32 _domain
  ) {
    bridgeAddress = _bridgeAddress;
    dispatcherAddress = _dispatcherAddress;
    domain = _domain;
    unlockAddress = _unlockAddress;
  }

  /**
   * MODIFIERS
   */
  
  // Check is sender is current chain Unlock multisig address
  function _isUnlockOwner() internal view returns (bool) {    
    return IUnlock(unlockAddress).owner() == msg.sender;
  }

  function _getProxyAdmin(address proxy) internal view returns (address) {
    address proxyAdminAddress = IUnlock(proxy)._getAdmin();
    return proxyAdminAddress;
  }
  
  /** 
   * @notice The receiver function as required by the IXReceiver interface.
   * @dev The Connext bridge contract will call this function.
   */
  function xReceive(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address caller, // address of the contract on the origin chain
    uint32 origin, // 	Domain ID of the origin chain
    bytes memory callData
  ) external returns (bytes memory) {

    // TODO: allow also multisig
    if(
      // sender is the bridge
      msg.sender != bridgeAddress
      || 
      // origin sender is not mainnet dispatcher
      caller != dispatcherAddress 
      ||
      // origin is not mainnet
      origin != 6648936
      ||
      // we are on mainnet
      block.chainid == 1 
      ) {
      revert Unauthorized(msg.sender);
    }

    // TODO: parse msg.value properly
    uint valueToSend = currency != address(0) ? amount: 0;

    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));

    // check where to forward the call
    address contractToCall;    
    if(action == 1) { 
      contractToCall = unlockAddress;
    } else if (action == 2) { 
      contractToCall = _getProxyAdmin(unlockAddress);
    }

    (bool success, ) = contractToCall.call{value: valueToSend}(execCallData);

    // catch revert reason
    if (success == false) {
      assembly {
        let ptr := mload(0x40)
        let size := returndatasize()
        returndatacopy(ptr, 0, size)
        revert(ptr, size)
      }
    }

    emit BridgeCallReceived(
      transferId,
      action,
      contractToCall, 
      execCallData
    );
  }

}