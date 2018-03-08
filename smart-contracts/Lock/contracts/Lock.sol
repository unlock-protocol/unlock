pragma solidity ^0.4.18;

/// @title The Lock contract
/// @author Julien Genestoux (ouvre-boite.com)
/// Evenually: implement ERC721

contract Lock {

  // The struct for a key
  struct Key {
    address owner;
    uint expirationTimestamp;
    string data; // This can be expensive
  }

  // Lock owner
  address public owner;

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
  uint public totalSupply;

  // Keys
  // Each owner can have at most exactly one key
  mapping (address => Key) owners;

  // If the keyReleaseMechanism is approved, we keep track of addresses who have been approved
  mapping (address => Key) approvedOwners;

  // Will be used with onlyBy(owner) and onlyBy(unlockProtocol)
  modifier onlyBy(address _account) {
      require(msg.sender == _account);
      // Do not forget the "_;"! It will
      // be replaced by the actual function
      // body when the modifier is used.
      _;
  }

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
  }

  /**
  * @dev Purchase function: this lets user purchase keys from the lock.
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the user has not been previously approved
  *  - the amount value is smaller than the price
  *  - the sender already owns a key
  */
  function purchase() public payable {
    require(keyReleaseMechanism != KeyReleaseMechanisms.Private);

  }

}
