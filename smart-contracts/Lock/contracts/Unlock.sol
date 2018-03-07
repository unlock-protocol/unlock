pragma solidity ^0.4.18;

/// @title The Unlock contract
/// @author Julien Genestoux (ouvre-boite.com)
/// Evenually: implement ERC20 for the token supply

import './Lock.sol';

contract Unlock {

  // Events
  event NewLock(
    address indexed lockBeneficiary,
    bytes32 lockId,
    address indexed newLockAddress
  );

  /**
  * @dev Create lock
  */
  function createLock(
    bytes32 _lockId, // Not stored. Used to identify created locks.
    Lock.KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _expirationTimestamp,
    address _keyPriceCalculator,
    uint _keyPrice,
    uint _maxNumberOfKeys) public {

    // create lock
    Lock lock = new Lock(
      msg.sender,
      address(this),
      _keyReleaseMechanism,
      _expirationDuration,
      _expirationTimestamp,
      _keyPriceCalculator,
      _keyPrice,
      _maxNumberOfKeys
    );

    // trigger event
    NewLock(msg.sender, _lockId, address(lock));
  }

}
