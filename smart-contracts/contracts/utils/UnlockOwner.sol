// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * UnlockOwner is used to facilitate the governance of the Unlock protocol
 * accross multiple chains. His role is to manage the state of the Unlock contract
 * based on instructions coming from the DAO on mainnet via the Connext bridge.
 * 
 * There are two kind of instructions that can be sent :
 * - 1. change in Unlock settings
 * - 2. upgrade of the Unlock contract (via its proxyAdmin)
 *
 * As a security measure, this contract also has an `exec` function 
 * that can be used to send calls directly (without going through a bridge)
 * through a multisig wallet managed by the Unlock team.
 * 
 */


import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import '../interfaces/IUnlock.sol';

contract UnlockOwner {

  // address of the connext bridge on the current chain
  address public bridgeAddress;

  // address of Unlock on the current chain
  address public unlockAddress;

  // address of Unlock team multisig wallet for the current chain
  address public multisigAddress;
  
  // address of the DAO on mainnet (used to verify trusted origin)
  address public daoAddress;

  // the domain ID of the current network (defined by Connext)
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
    bytes execCallData,
    bytes returnedData
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
    return msg.sender == multisigAddress;
  }
  
  function _isDAO() internal view returns (bool) {
    return msg.sender == daoAddress;
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

  /**
   * helper used to get the proxyAdmin address from the Unlock contract
   */
  function _getProxyAdmin(address proxy) internal view returns (address) {
    address proxyAdminAddress = IUnlock(proxy).getAdmin();
    return proxyAdminAddress;
  }

  /**
   * Internal helper to execute a call
   * @param action the type of action to perform is decribed as a number. Currently, 
   * two types of actions are available : `1` to pass directly the callData to the Unlock contract, 
   * and `2` to trigger a contract upgrade through Unlock's ProxyAdmin
   * @param value amount of (native) tokens to send with the contract call
   * @param callData the data to pass in the call 
   */
  function _execAction(uint8 action, uint value, bytes memory callData) internal returns (address, bytes memory) {
    
    // check where to forward the call
    address contractToCall;    
    if(action == 1) { 
      contractToCall = unlockAddress;
    } else if (action == 2) { 
      contractToCall = _getProxyAdmin(unlockAddress);
    }

    (bool success, bytes memory returnedData) = contractToCall.call{value: value}(callData);

    // catch revert reason
    if (success == false) {
      assembly {
        let ptr := mload(0x40)
        let size := returndatasize()
        returndatacopy(ptr, 0, size)
        revert(ptr, size)
      }
    }

    return (contractToCall, returnedData);
  }

  /**
   * This function can be called by the multisig to remove itself, so only the DAO
   * is left as sole owner of the Unlock contract
   * @param _newMultisig the address of a multisig contract. If set to `address(0)` then
   * the multisig will be entirely renounced from the current contract with no way to add it back
   */
  function changeMultisig(address _newMultisig) external {
    if ( !_isMultisig()) {
      revert Unauthorized(msg.sender);
    }
    multisigAddress = _newMultisig;
  } 


  /**
   * Calling this function will execute directly a call to Unlock or a proxy upgrade
   * @notice This function can only be called by the multisig specified in the constructor
   * @param callData the encoded bytes should contains both the call data to be executed and 
   *  the *action* code that follows `_execAction` pattern (see above).
   * @return the address of the contract where code has been executed
   */
  function execMultisig (bytes memory callData) external payable returns (address, bytes memory) {
    if(!_isMultisig()) {
      revert Unauthorized(msg.sender);
    }
    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));
    (address contractCalled, bytes memory returnedData) = _execAction(action, msg.value, execCallData);
    return (contractCalled, returnedData);
  }

  /**
   * This function is used to call Unlock or perform a proxy upgrade on mainnet
   * @notice only callable by DAO 
   * @param callData the encoded bytes should contains both the call data to be executed and 
   *  the *action* code that follows `_execAction` pattern (see above).
   * @return the address of the contract where code has been executed
   */
  function execDAO (bytes memory callData) external payable returns (address, bytes memory) {
    if(!_isDAO() && block.chainid != 1) {
      revert Unauthorized(msg.sender);
    }
    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));
    (address contractCalled, bytes memory returnedData) = _execAction(action, msg.value, execCallData);
    return (contractCalled, returnedData);
  }

  /** 
   * The receiver function as required by the bridge IXReceiver interface.
   * @notice calls can only be sent by the DAO on mainnet through the bridge
   * @dev The Connext bridge contract will call this function, that will trigger
   * a `_execAction` locally
   */
  function xReceive(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address caller, // address of the contract on the origin chain
    uint32 origin, // 	Domain ID of the origin chain
    bytes memory callData
  ) external returns (bytes memory) {

    // only DAO on mainnet through the bridge
    if(!_isBridgedDAO(origin, caller)) {
      revert Unauthorized(msg.sender);
    }

    // unpack calldata args
    (uint8 action, bytes memory execCallData) = abi.decode(callData, (uint8, bytes));

    (address contractCalled,  bytes memory returnedData) = _execAction(action, 0, execCallData);

    emit BridgeCallReceived(
      transferId,
      action,
      contractCalled, 
      execCallData,
      returnedData
    );
  }

}