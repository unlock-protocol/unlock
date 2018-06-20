pragma solidity ^0.4.18;

/// @title The Unlock contract
/// @author Julien Genestoux (ouvre-boite.com)
/// Evenually: implement ERC20 for the token supply

import './Lock.sol';

contract Unlock {

  // The struct for a lock
  struct LockBalances {
    uint totalSales;
    uint yieldedDiscountTokens;
  }

  uint public grossNetworkProduct;

  uint public totalDiscountGranted;

  // We keep track of deployed locks to ensure that callers are all deployed locks.
  mapping (address => LockBalances) public locks;

  // Events
  event NewLock(
    address indexed lockOwner,
    address indexed newLockAddress
  );

  /**
  * @dev Create lock
  * This deploys a lock for a creator. It also keeps track of the deployed lock.
  */
  function createLock(
    Lock.KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public
    returns (Lock lock)
  {

    // create lock
    Lock newLock = new Lock(
      msg.sender,
      _keyReleaseMechanism,
      _expirationDuration,
      _keyPrice,
      _maxNumberOfKeys
    );

    // Assign the new Lock
    locks[address(newLock)] = LockBalances({
      totalSales: 0,
      yieldedDiscountTokens: 0
    });

    // trigger event
    emit NewLock(msg.sender, address(newLock));

    // return the created lock
    return newLock;
  }

  /**
   * This function returns the discount available for a user, when purchasing a
   * a key from a lock.
   * This does not modify the state
   */
  function computeAvailableDiscountFor(
    address _purchaser
  )
    public
    view
    returns (uint discount)
  {
    return 0;
  }

  /**
   * This function keeps track of the added/increased GDP, as well as grants of discount tokens
   * to the referrer, if applicable.
   * The number of discount tokens granted is based on the value of the referal,
   * the current growth rate and the lock's discount token distribution rate
   * This function is invoked by a previously deployed lock only.
   */
  function recordKeyPurchase(
    uint _value,
    address _referrer
  )
    public
  {
    // TODO: implement me
  }

  /**
   * This function will keep track of consumed discounts by a given user.
   * It will also grant discount tokens to the creator who is granting the discount based on the
   * amount of discount and compensation rate.
   * It will also grant discount tokens to the creator of the lock on which the discount was consumed
   * This function is invoked by a previously deployed lock only.
   */
  function recordConsumedDiscount()
    public
  {
    // TODO: implement me
  }

}
