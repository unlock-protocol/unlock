pragma solidity 0.4.24;

import "./ERC721.sol";

/**
 * @title The Lock interface core methods for a Lock
 * @author Julien Genestoux (unlock-protocol.com)
 */
interface ILockCore {

  /**
  * @dev Purchase function, public version, with no referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _data optional marker for the key
  */
  function purchaseFor(
    address _recipient,
    bytes _data
  )
    external
    payable;

  /**
  * @dev Purchase function, public version, with referrer.
  * @param _recipient address of the recipient of the purchased key
  * @param _referrer address of the user making the referral
  * @param _data optional marker for the key
  */
  function purchaseForFrom(
    address _recipient,
    address _referrer,
    bytes _data
  )
    external
    payable;

  /**
   * Public function which returns the total number of keys (both expired and valid)
   */
  function outstandingKeys()
    external
    view
    returns (uint);

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(
    address _owner
  )
    external
    view
    returns (bytes data);

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

}
