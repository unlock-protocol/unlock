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

  // Lock Beneficiary
  address public beneficiary;

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

  // Keys
  // Each owner can have at most exactly one key
  mapping (address => Key) owners;

  // If the keyReleaseMechanism is approved, we keep track of addresses who want to be approved
  mapping (address => Key) pendingOwners;

  // Will be used with onlyBy(beneficiary) and onlyBy(unlockProtocol)
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
  function Lock(address _beneficiary,
    address _unlockProtocol,
    KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _expirationTimestamp,
    address _keyPriceCalculator,
    uint _keyPrice,
    uint _maxNumberOfKeys) public {
      beneficiary = _beneficiary;
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
