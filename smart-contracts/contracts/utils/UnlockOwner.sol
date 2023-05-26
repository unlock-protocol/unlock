// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * UnlockOwner is used to facilitate the governance of the Unlock protocol
 * accross multiple chains. Its role is to manage the state of the Unlock contract
 * based on instructions coming from the DAO on mainnet via the Connext bridge.
 *
 * There are two kind of instructions that can be sent :
 * - 1. change in Unlock settings
 * - 2. upgrade of the Unlock contract (via its proxyAdmin)
 *
 * As a security measure, this contract also has an `exec` function
 * that can be used to send calls directly (without going through a bridge)
 * through a multi-sig wallet managed by the Unlock team. This can be changed
 * by the DAO at any time, and the Unlock Labs team expects to renounce eventually
 * that role as we are confident that none of the dependencies in place can prevent a healthy
 * governance mechanism (bridge compromised... etc)
 *
 *
 */

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import "../interfaces/IUnlock.sol";

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract UnlockOwner is TimelockController {
  // address of the connext bridge on the current chain
  address public bridge;

  // address of Unlock on the current chain
  address public unlock;

  // address of Unlock team multisig wallet for the current chain
  address public multisig;

  // address of the DAO on mainnet (used to verify trusted origin)
  address public daoTimelock;

  // the timelock used on destinatio chain
  address public timelock;

  // the domain ID of the current network (defined by Connext)
  uint32 public domain;

  // required for testing
  uint public daoChainId;

  // Errors
  error OnlyUnlock();
  error ChainNotSet();
  error LengthMismatch();
  error Unauthorized(address sender);
  error InsufficientApproval(uint requiredAmount);
  error InsufficientBalance();

  // log xReceive params
  event BridgeCallReceived(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address caller, // address of the contract on the origin chain
    uint32 origin, // 	Domain ID of the origin chain
    bytes callData
  );

  event UnlockOperationScheduled(
    bytes32 transferId,
    bytes32 scheduleId,
    uint8 action,
    address contractToCall,
    bytes execCallData
  );

  event UnlockOperationExecuted(
    uint8 action,
    address contractToCall,
    bytes callData
  );

  // constructor helpers as we can not declare arrays directly in constructor
  function _getConstructorArray()
    private
    pure
    returns (address[] memory _constructorArray)
  {}

  /**
   * @param _bridge address of connext contract on current chain
   * @param _unlock address of the Unlock contract on current chain
   * @param _timelockDao the address of the timelock of the DAO on mainnet (which send instructions)
   * @param _multisig the address of the multisig contract
   * @param _domain the Domain ID of the current chain as used by the Connext Bridge
   * @param _daoChainId required for testing, default to 1.
   * https://docs.connext.network/resources/supported-chains
   */
  constructor(
    address _bridge,
    address _unlock,
    address _timelockDao,
    address _multisig,
    uint32 _domain,
    uint _daoChainId
  )
    // setup Timelock
    TimelockController(
      2 days, // minDelay
      _getConstructorArray(),
      _getConstructorArray(),
      multisig // admin
    )
  {
    // store params
    bridge = _bridge;
    unlock = _unlock;
    multisig = _multisig;
    daoTimelock = _timelockDao;
    domain = _domain;

    // required for testing purposes
    daoChainId = _daoChainId != 0 ? _daoChainId : 1;

    // setup timelock roles
    _setupRole(PROPOSER_ROLE, address(this));
    _setupRole(CANCELLER_ROLE, multisig);
    _setupRole(EXECUTOR_ROLE, address(0)); // any address can execute
  }

  /**
   * MODIFIERS
   */
  function _isMultisig() internal view returns (bool) {
    return msg.sender == multisig;
  }

  function _isDAO() internal view returns (bool) {
    return msg.sender == daoTimelock && block.chainid == daoChainId;
  }

  /**
   * helper to check if sender is mainnet DAO
   * @notice 6648936 is the ID representing mainnet domain on Connext Bridge
   */
  function _isBridgedDAO(
    uint32 origin,
    address caller
  ) internal view returns (bool) {
    return msg.sender == bridge && origin == 6648936 && caller == daoTimelock;
  }

  /**
   * helper used to get the proxyAdmin address from the Unlock contract
   */
  function _getProxyAdmin(address proxy) internal view returns (address) {
    address proxyAdminAddress = IUnlock(proxy).getAdmin();
    return proxyAdminAddress;
  }

  /**
   * Internal helper to decode a callData and parse it to create a contract call
   * @return action the type of action to perform is decribed as a number. Currently,
   * two types of actions are available : `1` to pass directly the callData to the Unlock contract,
   * and `2` to trigger a contract upgrade through Unlock's ProxyAdmin
   * @return contractToCall the address of the contract to send the call to
   * @return execCallData the data to pass with the contract the call
   */
  function _decodeCall(
    bytes calldata callData
  )
    internal
    view
    returns (uint8 action, address contractToCall, bytes memory execCallData)
  {
    (action, execCallData) = abi.decode(callData, (uint8, bytes));

    // check where to forward the call
    if (action == 1) {
      contractToCall = unlock;
    } else if (action == 2) {
      contractToCall = _getProxyAdmin(unlock);
    }
  }

  /**
   * Internal helper to decode a call
   * @param callData the data to pass in the call
   * @param value amount of (native) tokens to send with the contract call
   */
  function _execAction(
    uint value,
    bytes calldata callData
  ) internal returns (address, bytes memory) {
    (
      uint8 action,
      address contractToCall,
      bytes memory execCallData
    ) = _decodeCall(callData);
    (bool success, bytes memory returnedData) = contractToCall.call{
      value: value
    }(execCallData);

    // catch revert reason
    if (success == false) {
      assembly {
        let ptr := mload(0x40)
        let size := returndatasize()
        returndatacopy(ptr, 0, size)
        revert(ptr, size)
      }
    }

    emit UnlockOperationExecuted(action, contractToCall, execCallData);

    return (contractToCall, returnedData);
  }

  /**
   * This function can be called by the multisig to remove itself, so only the DAO
   * is left as sole owner of the Unlock contract
   * @param _newMultisig the address of a multisig contract. If set to `address(0)` then
   * the multisig will be entirely renounced from the current contract with no way to add it back
   */
  function changeMultisig(address _newMultisig) external {
    if (!_isMultisig()) {
      revert Unauthorized(msg.sender);
    }
    multisig = _newMultisig;
  }

  /**
   * Calling this function will execute directly a call to Unlock or a proxy upgrade
   * @notice This function can only be called by the DAO on mainnet
   * @param callData the encoded bytes should contains both the call data to be executed and
   *  the *action* code that follows `_execAction` pattern (see above).
   * @return the address of the contract where code has been executed
   */
  function execDAO(
    bytes calldata callData
  ) external payable returns (address, bytes memory) {
    if (!_isDAO()) {
      revert Unauthorized(msg.sender);
    }
    // unpack calldata args
    (address contractCalled, bytes memory returnedData) = _execAction(
      msg.value,
      callData
    );
    return (contractCalled, returnedData);
  }

  /**
   * Calling this function will execute directly a call to Unlock or a proxy upgrade
   * @notice This function can only be called by the multisig specified in the constructor
   * @param callData the encoded bytes should contains both the call data to be executed and
   *  the *action* code that follows `_execAction` pattern (see above).
   * @return the address of the contract where code has been executed
   */
  function execMultisig(
    bytes calldata callData
  ) external payable returns (address, bytes memory) {
    if (!_isMultisig()) {
      revert Unauthorized(msg.sender);
    }
    // unpack calldata args
    (address contractCalled, bytes memory returnedData) = _execAction(
      msg.value,
      callData
    );
    return (contractCalled, returnedData);
  }

  function _scheduleCall(bytes calldata callData, bytes32 transferId) private {
    // unpack calldata args
    (
      uint8 action,
      address contractToCall,
      bytes memory execCallData
    ) = _decodeCall(callData);

    // schedule for execution in timelock
    // NB: use of `this` to convert bytes memory to bytes calldata
    this.schedule(
      contractToCall, // target
      0, // value
      execCallData, // value
      bytes32(0), // predecessors set to zero as operation has no dependency
      transferId, // use connext transferId as salt
      2 days // delay is 2 days
    );

    bytes32 id = this.hashOperation(
      contractToCall,
      0,
      execCallData,
      bytes32(0),
      transferId
    );

    emit UnlockOperationScheduled(
      transferId,
      id,
      action,
      contractToCall,
      execCallData
    );
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
    bytes calldata callData
  ) external returns (bytes memory) {
    // only DAO on mainnet through the bridge
    if (!_isBridgedDAO(origin, caller)) {
      revert Unauthorized(msg.sender);
    }

    emit BridgeCallReceived(
      transferId,
      amount,
      currency,
      caller,
      origin,
      callData
    );

    _scheduleCall(callData, transferId);
  }
}
