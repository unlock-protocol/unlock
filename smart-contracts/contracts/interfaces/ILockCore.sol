pragma solidity 0.5.6;


/**
 * @title The Lock interface core methods for a Lock
 * @author HardlyDifficult (unlock-protocol.com)
 */
interface ILockCore {

  /**
  * @dev Purchase function, public version, with no referrer.
  * @param _recipient address of the recipient of the purchased key
  */
  function purchaseFor(
    address _recipient
  )
    external
    payable;

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer
  )
    external
    payable;

  /**
   * @dev Destroys the user's key and sends a refund based on the amount of time remaining.
   */
  function cancelAndRefund()
    external;

  /**
   * @dev Called by owner to withdraw all funds from the lock.
   */
  function withdraw(
  )
    external;

  /**
   * @dev Called by owner to partially withdraw funds from the lock.
   */
  function partialWithdraw(
    uint _amount
  )
    external;

  /**
   * A function which lets the owner of the lock expire a users' key.
   */
  function expireKeyFor(
    address _owner
  )
    external;

  /**
   * A function which lets the owner of the lock to change the price for future purchases.
   */
  function updateKeyPrice(
    uint _keyPrice
  )
    external;

  /**
  * @dev Used to disable lock before migrating keys and/or destroying contract.
  * @dev Reverts if called by anyone but the owner.
  * @dev Reverts if isAlive == false
  * @dev Should emit Disable event.
  */
  function disableLock(
  )
    external;

  /**
  * @dev Used to clean up old lock contracts from the blockchain by using selfdestruct.
  * @dev Reverts if called by anyone but the owner.
  * @dev Reverts if isAlive == true
  * @dev Should emit Destroy event.
   */
  function destroyLock(
  )
    external;

  /**
   * @dev Determines how much of a refund a key owner would receive if they issued
   * a cancelAndRefund now.
   * @param _owner The owner of the key check the refund value for.
   * Note that due to the time required to mine a tx, the actual refund amount will be lower
   * than what the user reads from this call.
   */
  function getCancelAndRefundValueFor(
    address _owner
  )
    external
    view
    returns (uint refund);

  /**
   * Checks if the user has a non-expired key.
   */
  function getHasValidKey(
    address _owner
  )
    external
    view
    returns (bool);

  /**
   * Public function which returns the total number of unique owners (both expired
   * and valid).  This may be larger than totalSupply.
   */
  function numberOfOwners()
    external
    view
    returns (uint);

  /**
   * Public function which returns the total number of keys (both expired and valid)
   *
   * This function signature is from the ERC-721 enumerable extension.
   * https://eips.ethereum.org/EIPS/eip-721
   * @notice Count NFTs tracked by this contract
   * @return A count of valid NFTs tracked by this contract, where each one of
   * them has an assigned and queryable owner not equal to the zero address
   */
  function totalSupply()
    external
    view
    returns (uint);

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(
    address _owner
  )
    external
    view
    returns (uint timestamp);

  /**
  * @param _page the page of key owners requested when faceted by page size
  * @param _pageSize the number of Key Owners requested per page
  */
  function getOwnersByPage(
    uint _page,
    uint _pageSize
  )
    external
    view
    returns (address[] memory);
}
