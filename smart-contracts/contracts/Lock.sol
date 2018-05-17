pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/// @title The Lock contract
/// @author Julien Genestoux (ouvre-boite.com)
/// Evenually: implement ERC721

contract Lock is Ownable {

  // The struct for a key
  struct Key {
    uint expirationTimestamp;
    string data; // This can be expensive
  }

  // Events
  event SoldKey (
    address indexed owner
  );

  // Unlock Protocol address
  address public unlockProtocol; // TODO

  // Key release mechanism
  enum KeyReleaseMechanisms { Public, Approved, Private }
  KeyReleaseMechanisms public keyReleaseMechanism;

  // Duration in seconds for which the keys are valid, after creation
  // should we take a smaller type use less gas?
  uint public expirationDuration;

  // Date at which keys expire
  // (only if expirationDuration is 0)
  uint public expirationTimestamp;

  // Address of the contract which computes the price of the next key
  address public keyPriceCalculator;

  // price in wei of the next key, only if keyPriceCalculator is null
  uint public keyPrice;

  // Max number of keys sold if the keyReleaseMechanism is public
  uint public maxNumberOfKeys;

  // Number of keys in circulation (expired or valid)
  uint public outstandingKeys;

  // Keys
  // Each owner can have at most exactly one key
  mapping (address => Key) public owners;

  // If the keyReleaseMechanism is approved, we keep track of addresses who have been approved
  mapping (address => Key) public approvedOwners;

  // Some functions are only allowed if the lock is public
  modifier onlyPublic() {
      require(keyReleaseMechanism == KeyReleaseMechanisms.Public);
      _;
  }

  // Constructor
  function Lock(address _owner,
    address _unlockProtocol,
    KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _expirationTimestamp,
    address _keyPriceCalculator,
    uint _keyPrice,
    uint _maxNumberOfKeys) public {
      owner = _owner;
      unlockProtocol = _unlockProtocol;
      keyReleaseMechanism = _keyReleaseMechanism;
      expirationDuration = _expirationDuration;
      expirationTimestamp = _expirationTimestamp;
      keyPriceCalculator = _keyPriceCalculator;
      keyPrice = _keyPrice;
      maxNumberOfKeys = _maxNumberOfKeys;
      outstandingKeys = 0;
  }

  /**
  * @dev Purchase function: this lets user purchase keys from the lock.
  * @param _data optional marker for the key
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the user has not been previously approved
  *  - the amount value is smaller than the price
  *  - the sender already owns a key
  * TODO: next version of solidity will allow for message to be added to require.
  */
  function purchase(string _data) public payable {
    require(keyReleaseMechanism != KeyReleaseMechanisms.Private);
    require(msg.value >= keyPrice); // We explicitly allow for greater amounts to allow "donations".
    require(maxNumberOfKeys > outstandingKeys);
    require(owners[msg.sender].expirationTimestamp < now); // User must not have a valid key already

    outstandingKeys += 1; // Increment the number of keys
    owners[msg.sender] = Key({
      expirationTimestamp: now + expirationDuration,
      data: _data
    });

    // trigger event
    emit SoldKey(msg.sender);
  }

  /**
  * @dev Returns the key for a given owner. Note: since web3 does not support struct yet, this
  * @param _owner address of the user for whom we search the key
  * method is not very useful for now.
  * Check keyDataFor and keyExpirationTimestampFor
  function keyFor(address _owner) public view returns (Lock.Key key) {
    return owners[_owner];
  }
  */

  /**
  * @dev Returns the key's data field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyDataFor(address _owner) public view returns (string data) {
    return owners[_owner].data;
  }

  /**
  * @dev Returns the key's ExpirationTimestamp field for a given owner.
  * @param _owner address of the user for whom we search the key
  */
  function keyExpirationTimestampFor(address _owner) public view returns (uint timestamp) {
    return owners[_owner].expirationTimestamp;
  }

  /**
   * @dev Called by owner to wiwthdraw all funds from the lock.
   * TODO: consider allowing anybody to trigger this as long as it goes to owner anyway?
   * TODO: consider partial withdraws?
   * TODO: check for re-entrency?
   */
   function withdraw() external onlyOwner {
     uint256 balance = address(this).balance;
     require(balance > 0);

     owner.transfer(balance);
   }

}
