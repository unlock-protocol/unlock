// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/**
 * GovDispatcher receives instructions from the DAO and forwards it to multiple chains.
 * It is meant to be deployed only once, on mainnet.
 */


import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovDispatcher is Ownable {

  address public bridgeAddress;
  address public daoAddress;

  mapping (uint => address) public unlockManagers;
  mapping (uint => uint32) public domains;

  // errors
  error LengthMismatch();
  error UnauthorizedAction(uint8 action);
  error Unauthorized(address sender);


  constructor (
    address _daoAddress, 
    address _bridgeAddress
  ) {
    daoAddress = _daoAddress;
    bridgeAddress = _bridgeAddress;
  }


  function setManagers(
    address[] memory _unlockManagers,
    uint[] memory _chainIds,
    uint32[] memory _domainIds
  ) public onlyOwner {
     if( _unlockManagers.length != _chainIds.length || _chainIds.length != _domainIds.length ){
      revert LengthMismatch();
    }

    for (uint i = 0; i < _domainIds.length; i++) {
      unlockManagers[_domainIds[i]] = _unlockManagers[i];
      domains[_chainIds[i]] = _domainIds[i];
    }
  }


  /**
   * This function receives call from DAO and dispatch to multiple chains
   * @dev only available for mainnet
   */
  function dispatch(
    uint[] memory _chainIds,
    bytes[] calldata _calldata
  ) public {
    if(
      msg.sender != daoAddress
      || 
      block.chainid !=1
    ) {
      revert Unauthorized(msg.sender);
    }

    // bridge tokens
    uint amount = 0; // amount to send across the bridge (if any)
    address asset = address(0); // asset to transfer (and to pay bridge fees)
    uint slippage = 30; // in basis point

    // send calls to all chains
    for (uint i = 0; i < _chainIds.length; i++) {
      // check calldata 
      (uint8 action, bytes memory targetCalldata) = abi.decode(_calldata[i], (uint8, bytes));
      
      // pick target: 1 for ProxyAdmin, 2 for Unlock
      if(action != 1 || action != 2) {
        revert UnauthorizedAction(action);
      }

      IConnext(bridgeAddress).xcall(
        domains[_chainIds[i]], // domainID
        unlockManagers[_chainIds[i]], // target contract
        asset,
        address(0), // delegate,
        amount, 
        slippage,
        targetCalldata
      );
    }

  }
}