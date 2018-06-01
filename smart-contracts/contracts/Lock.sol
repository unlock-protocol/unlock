pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
// import "zeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";

/**
 * @title The Lock contract
 * @author Julien Genestoux (ouvre-boite.com)
 * Eventually: implement ERC721.
 * @dev The Lock smart contract is an ERC721 compatible smart contract.
 *  However, is has some specificities:
 *  - Each address owns at most one single key (ERC721 allows for multiple owned NFTs)
 *  - Since each address owns at most one single key, the tokenId is equal to the owner
 */

contract Lock is Ownable {

  // The struct for a key
  struct Key {
    uint expirationTimestamp;
    string data; // Note: This can be expensive?
  }

  // Events

  /**
   * @dev This emits when ownership of any NFT changes by any mechanism.
   *  This event emits when NFTs are created (`from` == 0) and destroyed
   *  (`to` == 0). Exception: during contract creation, any number of NFTs
   *  may be created and assigned without emitting Transfer. At the time of
   *  any transfer, the approved address for that NFT (if any) is reset to none.
   */
  event Transfer (
    address indexed _from,
    address indexed _to,
    address indexed _tokenId
  );

  // Fields

  // Unlock Protocol address
  address internal unlockProtocol;

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
  mapping (address => Key) internal owners;

  // If the keyReleaseMechanism is approved, we keep track of addresses who have been approved
  mapping (address => Key) internal approvedOwners;

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
    emit Transfer(
      0, // This is a creation.
      msg.sender,
      msg.sender); // Note: since each user can own a single token, we use the current owner (new!) for the token id
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

  /**
   * @notice ERC721: Count all NFTs assigned to an owner.
   * In the specific case of a Lock, each owner can own only at most 1 key.

   * @dev NFTs assigned to the zero address are considered invalid, and this
    function throws for queries about the zero address.
   * @param _owner An address for whom to query the balance
   * @return The number of NFTs owned by `_owner`, either 0 or 1.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    require(_owner != address(0));
    return owners[_owner].expirationTimestamp > 0 ? 1 : 0;
  }

  /**
   * @notice ERC721: Find the owner of an NFT
   * @dev NFTs assigned to zero address are considered invalid, and queries
   *  about them do throw.
   * @param _tokenId The identifier for an NFT
   * @return The address of the owner of the NFT
  */
  function ownerOf(uint256 _tokenId) external view returns (address) {
    Key key = owners[address(_tokenId)];
    require(key.expirationTimestamp > 0);
    return address(_tokenId);
  }
}
