// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * UnlockManager receives and send instructions from bridges 
 * to Unlock contracts deployed on various chains. It triggers upgrades
 * and settings, following orders coming from mainnet.
 */


import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import '../interfaces/IUnlock.sol';

contract UnlockManager {

  address public bridgeAddress;
  address public unlockAddress;
  address public multisigAddress;
  address public daoAddress;
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
    address _unlockAddress,
    address _daoAddress,
    address _multisigAddress,
    uint32 _domain
  ) {
    bridgeAddress = _bridgeAddress;
    unlockAddress = _unlockAddress;
    multisigAddress = _multisigAddress;
    daoAddress = _daoAddress;
    domain = _domain;
  }

  /**
   * MODIFIERS
   */
  
  // Check is sender is current chain Unlock multisig address
  function _isUnlockOwner() internal view returns (bool) {    
    return msg.sender == IUnlock(unlockAddress).owner();
  }

  function _isMultisig() internal view returns (bool) {
    msg.sender != multisigAddress;
  }
  
  function _isDAO() internal view returns (bool) {
    msg.sender != daoAddress && block.chainid != 1;
  }


  /**
   * helper to check if sender is mainnet DAO
   * @notice 6648936 is the ID representing mainnet domain on Connext Bridge
   */
  function _isBridgedDAO(uint32 origin, address caller) internal view returns(bool) {
    return msg.sender == bridgeAddress 
      && origin == 6648936 
      && caller == daoAddress;
  }

  function _getProxyAdmin(address proxy) internal view returns (address) {
    address proxyAdminAddress = IUnlock(proxy)._getAdmin();
    return proxyAdminAddress;
  }

  /**
   * Internal helper to execute a call
   * @param action 1 for contract upgrade through ProxyAdmin, 2 for contract call
   * @param value amount of native tokens to send with the contract call
   * @param callData the data to pass in the call 
   */
  function _execAction(uint8 action, uint value, bytes memory callData) internal returns (address) {
    
    // check where to forward the call
    address contractToCall;    
    if(action == 1) { 
      contractToCall = unlockAddress;
    } else if (action == 2) { 
      contractToCall = _getProxyAdmin(unlockAddress);
    }

    (bool success, ) = contractToCall.call{value: value}(callData);

    // catch revert reason
    if (success == false) {
      assembly {
        let ptr := mload(0x40)
        let size := returndatasize()
        returndatacopy(ptr, 0, size)
        revert(ptr, size)
      }
    }

    return contractToCall;
  }


  /**
   * This function can only be called by multisig
   */
  function exec (bytes memory callData) external payable returns (address) {
    if(!_isMultisig()) {
      revert Unauthorized(msg.sender);
    }
    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));
    (address contractCalled) = _execAction(action, msg.value, execCallData);
    return contractCalled;
  }


  /**
   * Only called by DAO on mainnet
   * @param domainId the domain ID to target as defined by Connext https://docs.connext.network/resources/supported-chains
   * @param targetContract the contract that will receive the call
   * @param callData the data to be executed on the destination chain 
   * @param asset asset to transfer (can be used to pay bridge fees)
   * @param amount amount to send across the bridge
   * @param delegate address that can revert or forceLocal on destination
   * @param slippage in basis point
   * @return transferId the Connext ID that can be used to track status on the bridge
   */
  function dispatch(
    uint32 domainId,
    address targetContract,
    bytes memory callData,
    address asset,
    uint amount,
    address delegate,
    uint slippage
  ) external returns (bytes32 transferId) {
    if(!_isDAO()) {
      revert Unauthorized(msg.sender);
    }

    transferId = IConnext(bridgeAddress).xcall(
        domainId,
        targetContract,
        asset,
        address(0), // delegate,
        amount, 
        slippage,
        callData
      );
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

    // The calls can only be sent by 
    // 1) the DAO on mainnet through the bridge
    // 2) the team multisig on current chain
    if(!_isBridgedDAO(origin, caller) && _isMultisig()) {
      revert Unauthorized(msg.sender);
    }

    // TODO: parse msg.value properly
    uint valueToSend = currency != address(0) ? amount: 0;

    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));

    (address contractCalled) = _execAction(action, valueToSend, execCallData);

    emit BridgeCallReceived(
      transferId,
      action,
      contractCalled, 
      execCallData
    );
  }

}