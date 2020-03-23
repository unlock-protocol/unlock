pragma solidity 0.5.17;

import './MixinDisable.sol';
import './MixinApproval.sol';
import './MixinKeys.sol';
import './MixinFunds.sol';
import './MixinLockCore.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721Receiver.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';

/**
 * @title Mixin for the transfer-related functions needed to meet the ERC721
 * standard.
 * @author Nick Furfaro
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinApproval
{
  using SafeMath for uint;
  using Address for address;

  event TransferFeeChanged(
    uint transferFeeBasisPoints
  );

  // 0x150b7a02 == bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

  // The fee relative to keyPrice to charge when transfering a Key to another account
  // (potentially on a 0x marketplace).
  // This is calculated as `keyPrice * transferFeeBasisPoints / BASIS_POINTS_DEN`.
  uint public transferFeeBasisPoints;

  /**
  * @notice Allows the key owner to safely share their key (parent key) by
  * transferring a portion of the remaining time to a new key (child key).
  * @param _to The recipient of the shared key
  * @param _tokenId the key to share
  * @param _timeShared The amount of time shared
  */
  function shareKey(
    address _to,
    uint _tokenId,
    uint _timeShared
  ) public
    onlyIfAlive
    onlyKeyManagerOrApproved(_tokenId)
  {
    require(transferFeeBasisPoints < BASIS_POINTS_DEN, 'KEY_TRANSFERS_DISABLED');
    require(_to != address(0), 'INVALID_ADDRESS');
    address keyOwner = _ownerOf[_tokenId];
    require(getHasValidKey(keyOwner), 'KEY_NOT_VALID');
    Key storage fromKey = keyByOwner[keyOwner];
    Key storage toKey = keyByOwner[_to];
    uint idTo = toKey.tokenId;
    uint time;
    // get the remaining time for the origin key
    uint timeRemaining = fromKey.expirationTimestamp - block.timestamp;
    // get the transfer fee based on amount of time wanted share
    uint fee = getTransferFee(keyOwner, _timeShared);
    uint timePlusFee = _timeShared.add(fee);

    // ensure that we don't try to share too much
    if(timePlusFee < timeRemaining) {
      // now we can safely set the time
      time = _timeShared;
      // deduct time from parent key, including transfer fee
      _timeMachine(_tokenId, timePlusFee, false);
    } else {
      // we have to recalculate the fee here
      fee = getTransferFee(keyOwner, timeRemaining);
      time = timeRemaining - fee;
      fromKey.expirationTimestamp = block.timestamp; // Effectively expiring the key
      emit ExpireKey(_tokenId);
    }

    if (idTo == 0) {
      _assignNewTokenId(toKey);
      idTo = toKey.tokenId;
      _recordOwner(_to, idTo);
      emit Transfer(
        address(0), // This is a creation or time-sharing
        _to,
        idTo
      );
    } else if (toKey.expirationTimestamp <= block.timestamp) {
      // reset the key Manager for expired keys
      _resetKeyManagerOf(idTo);
    }

    // add time to new key
    _timeMachine(idTo, time, true);
    // trigger event
    emit Transfer(
      keyOwner,
      _to,
      idTo
    );

    require(_checkOnERC721Received(keyOwner, _to, _tokenId, ''), 'NON_COMPLIANT_ERC721_RECEIVER');
  }

  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
    onlyIfAlive
    hasValidKey(_from)
    onlyKeyManagerOrApproved(_tokenId)
  {
    require(isKeyOwner(_tokenId, _from), 'TRANSFER_FROM: NOT_KEY_OWNER');
    require(transferFeeBasisPoints < BASIS_POINTS_DEN, 'KEY_TRANSFERS_DISABLED');
    require(_recipient != address(0), 'INVALID_ADDRESS');
    uint fee = getTransferFee(_from, 0);

    Key storage fromKey = keyByOwner[_from];
    Key storage toKey = keyByOwner[_recipient];

    uint previousExpiration = toKey.expirationTimestamp;
    // subtract the fee from the senders key before the transfer
    _timeMachine(_tokenId, fee, false);

    if (toKey.tokenId == 0) {
      toKey.tokenId = _tokenId;
      _recordOwner(_recipient, _tokenId);
    }

    if (previousExpiration <= block.timestamp) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the sender's key expiration
      // An expired key is no longer a valid key, so the new tokenID is the sender's tokenID
      toKey.expirationTimestamp = fromKey.expirationTimestamp;
      toKey.tokenId = _tokenId;

      // Reset the key Manager to the key owner
      _resetKeyManagerOf(_tokenId);

      _recordOwner(_recipient, _tokenId);
    } else {
      // The recipient has a non expired key. We just add them the corresponding remaining time
      // SafeSub is not required since the if confirms `previousExpiration - block.timestamp` cannot underflow
      toKey.expirationTimestamp = fromKey
        .expirationTimestamp.add(previousExpiration - block.timestamp);
    }

    // Effectively expiring the key for the previous owner
    fromKey.expirationTimestamp = block.timestamp;

    // Set the tokenID to 0 for the previous owner to avoid duplicates
    fromKey.tokenId = 0;

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
  * @notice Transfers the ownership of an NFT from one address to another address
  * @dev This works identically to the other function with an extra data parameter,
  *  except this function just sets data to ''
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId
  )
    public
  {
    safeTransferFrom(_from, _to, _tokenId, '');
  }

  /**
  * @notice Transfers the ownership of an NFT from one address to another address.
  * When transfer is complete, this functions
  *  checks if `_to` is a smart contract (code size > 0). If so, it calls
  *  `onERC721Received` on `_to` and throws if the return value is not
  *  `bytes4(keccak256('onERC721Received(address,address,uint,bytes)'))`.
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  * @param _data Additional data with no specified format, sent in call to `_to`
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId,
    bytes memory _data
  )
    public
  {
    transferFrom(_from, _to, _tokenId);
    require(_checkOnERC721Received(_from, _to, _tokenId, _data), 'NON_COMPLIANT_ERC721_RECEIVER');

  }

  /**
   * Allow the Lock owner to change the transfer fee.
   */
  function updateTransferFee(
    uint _transferFeeBasisPoints
  )
    external
    onlyOwner
  {
    emit TransferFeeChanged(
      _transferFeeBasisPoints
    );
    transferFeeBasisPoints = _transferFeeBasisPoints;
  }

  /**
   * Determines how much of a fee a key owner would need to pay in order to
   * transfer the key to another account.  This is pro-rated so the fee goes down
   * overtime.
   * @param _keyOwner The owner of the key check the transfer fee for.
   */
  function getTransferFee(
    address _keyOwner,
    uint _time
  )
    public view
    hasValidKey(_keyOwner)
    returns (uint)
  {
    Key storage key = keyByOwner[_keyOwner];
    uint timeToTransfer;
    uint fee;
    // Math: safeSub is not required since `hasValidKey` confirms timeToTransfer is positive
    // this is for standard key transfers
    if(_time == 0) {
      timeToTransfer = key.expirationTimestamp - block.timestamp;
    } else {
      timeToTransfer = _time;
    }
    fee = timeToTransfer.mul(transferFeeBasisPoints) / BASIS_POINTS_DEN;
    return fee;
  }

  /**
   * @dev Internal function to invoke `onERC721Received` on a target address
   * The call is not executed if the target address is not a contract
   * @param from address representing the previous owner of the given token ID
   * @param to target address that will receive the tokens
   * @param tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return whether the call correctly returned the expected magic value
   */
  function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  )
    internal
    returns (bool)
  {
    if (!to.isContract()) {
      return true;
    }
    bytes4 retval = IERC721Receiver(to).onERC721Received(
      msg.sender, from, tokenId, _data);
    return (retval == _ERC721_RECEIVED);
  }

}