pragma solidity ^0.4.18;

/// @title The Unlock contract
/// @author Julien Genestoux (ouvre-boite.com)
/// Evenually: implement ERC20 for the token supply

import './Lock.sol';

contract Unlock {

  // Events
  event NewLock(
    address indexed lockOwner,
    address indexed newLockAddress
  );

  /**
  * @dev Create lock
  */
  function createLock(
    Lock.KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _expirationTimestamp,
    address _keyPriceCalculator,
    uint _keyPrice,
    uint _maxNumberOfKeys) public returns (Lock lock){

    // create lock
    Lock newLock = new Lock(
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
    NewLock(msg.sender, address(newLock));

    // return the created lock
    return newLock;
  }

}
