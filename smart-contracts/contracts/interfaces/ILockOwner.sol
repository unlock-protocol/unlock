pragma solidity 0.4.24;

/**
 * @title The Lock interface for owner specific functionality
 * @author Julien Genestoux (unlock-protocol.com)
 */
interface ILockOwner {

  /**
   * @dev Called by owner to wiwthdraw all funds from the lock.
   */
  function withdraw(
  )
    external;

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner
  )
    external;

}
