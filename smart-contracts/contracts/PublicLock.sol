pragma solidity 0.4.25;

import './interfaces/IUnlock.sol';
import './interfaces/IERC721.sol';
import './interfaces/ILockCore.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/introspection/ERC165.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol';
import './mixins/MixinApproval.sol';
import './mixins/MixinDisableAndDestroy.sol';
import './mixins/MixinKeys.sol';
import './mixins/MixinLockCore.sol';
import './mixins/MixinRefunds.sol';
import './mixins/MixinNoFallback.sol';

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * Eventually: implement ERC721.
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://eips.ethereum.org/EIPS/eip-721
 */
contract PublicLock is
  MixinNoFallback,
  IERC721,
  ILockCore,
  IERC721Receiver,
  ERC165,
  Ownable,
  MixinDisableAndDestroy,
  MixinKeys,
  MixinApproval,
  MixinLockCore,
  MixinRefunds
{
  using SafeMath for uint;

  // Events
  // Fields
  // Constructor
  constructor(
    address _owner,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    uint _version
  ) public
    MixinLockCore(_owner, _expirationDuration, _keyPrice, _maxNumberOfKeys, _version)
  {
  }

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
    payable
    onlyIfAlive
  {
    return _purchaseFor(_recipient, address(0), _data);
  }

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
    payable
    onlyIfAlive
    hasValidKey(_referrer)
  {
    return _purchaseFor(_recipient, _referrer, _data);
  }

  /**
   * This is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    external
    payable
    onlyIfAlive
    notSoldOut()
    hasValidKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');

    Key storage fromKey = _getKeyFor(_from);
    Key storage toKey = _getKeyFor(_recipient);

    uint previousExpiration = toKey.expirationTimestamp;

    if (previousExpiration == 0) {
      // The recipient did not have a key previously
      _addNewOwner(_recipient);
      _setKeyOwner(_tokenId, _recipient);
      toKey.tokenId = _tokenId;
    }

    if (previousExpiration <= block.timestamp) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the
      // sender's key expiration
      toKey.expirationTimestamp = fromKey.expirationTimestamp;
    } else {
      // The recipient has a non expired key. We just add them the corresponding remaining time
      // SafeSub is not required since the if confirms `previousExpiration - block.timestamp` cannot underflow
      toKey.expirationTimestamp = fromKey
        .expirationTimestamp.add(previousExpiration - block.timestamp);
    }
    // Overwite data in all cases
    toKey.data = fromKey.data;

    // Effectively expiring the key for the previous owner
    fromKey.expirationTimestamp = block.timestamp;

    // Clear any previous approvals
    _clearApproval(_tokenId);

    // trigger event
    emit Transfer(
      _from,
      _recipient,
      _tokenId
    );
  }

  /**
   * @notice Handle the receipt of an NFT
   * @dev The ERC721 smart contract calls this function on the recipient
   * after a `safeTransfer`. This function MUST return the function selector,
   * otherwise the caller will revert the transaction. The selector to be
   * returned can be obtained as `this.onERC721Received.selector`. This
   * function MAY throw to revert and reject the transfer.
   * Note: the ERC721 contract address is always the message sender.
   * @param operator The address which called `safeTransferFrom` function
   * @param from The address which previously owned the token
   * @param tokenId The NFT identifier which is being transferred
   * @param data Additional data with no specified format
   * @return `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`
   */
  function onERC721Received(
    address operator, // solhint-disable-line no-unused-vars
    address from, // solhint-disable-line no-unused-vars
    uint tokenId, // solhint-disable-line no-unused-vars
    bytes memory data // solhint-disable-line no-unused-vars
  )
    public
    returns(bytes4)
  {
    return this.onERC721Received.selector;
  }

  /**
  * @dev Purchase function: this lets a user purchase a key from the lock for another user
  * @param _recipient address of the recipient of the purchased key
  * @param _data optional marker for the key
  * This will fail if
  *  - the keyReleaseMechanism is private
  *  - the keyReleaseMechanism is Approved and the recipient has not been previously approved
  *  - the amount value is smaller than the price
  *  - the recipient already owns a key
  * TODO: next version of solidity will allow for message to be added to require.
  */
  function _purchaseFor(
    address _recipient,
    address _referrer,
    bytes memory _data
  )
    internal
    notSoldOut()
  { // solhint-disable-line function-max-lines
    require(_recipient != address(0), 'INVALID_ADDRESS');

    // Let's get the actual price for the key from the Unlock smart contract
    IUnlock unlock = IUnlock(unlockProtocol);
    uint discount;
    uint tokens;
    uint inMemoryKeyPrice = keyPrice;
    (discount, tokens) = unlock.computeAvailableDiscountFor(_recipient, inMemoryKeyPrice);
    uint netPrice = inMemoryKeyPrice;
    if (discount > inMemoryKeyPrice) {
      netPrice = 0;
    } else {
      // SafeSub not required as the if statement already confirmed `inMemoryKeyPrice - discount` cannot underflow
      netPrice = inMemoryKeyPrice - discount;
    }

    // We explicitly allow for greater amounts to allow 'donations' or partial refunds after
    // discounts (TODO implement partial refunds)
    require(msg.value >= netPrice, 'NOT_ENOUGH_FUNDS');
    // TODO: If there is more than the required price, then let's return whatever is extra
    // extra (CAREFUL: re-entrancy!)

    // Assign the key
    Key storage toKey = _getKeyFor(_recipient);
    uint previousExpiration = toKey.expirationTimestamp;
    if (previousExpiration < block.timestamp) {
      if (previousExpiration == 0) {
        // This is a brand new owner, else an owner of an expired key buying an extension.
        // We increment the tokenId counter
        numberOfKeysSold++;
        _addNewOwner(_recipient);
        // We register the owner of the new tokenID
        _setKeyOwner(numberOfKeysSold, _recipient);
        // we assign the incremented `numberOfKeysSold` as the tokenId for the new key
        toKey.tokenId = numberOfKeysSold;
      }
      // SafeAdd is not required here since expirationDuration is capped to a tiny value
      // (relative to the size of a uint)
      toKey.expirationTimestamp = block.timestamp + expirationDuration;
    } else {
      // This is an existing owner trying to extend their key
      toKey.expirationTimestamp = previousExpiration.add(expirationDuration);
    }
    // Overwite data in all cases
    toKey.data = _data;

    if (discount > 0) {
      unlock.recordConsumedDiscount(discount, tokens);
    }

    unlock.recordKeyPurchase(netPrice, _referrer);

    // trigger event
    emit Transfer(
      address(0), // This is a creation.
      _recipient,
      numberOfKeysSold
    );
  }
}
