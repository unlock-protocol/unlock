pragma solidity 0.5.12;

import './MixinDisableAndDestroy.sol';
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

  event TimestampChanged(
    uint indexed _tokenId,
    uint _amount,
    bool _timeAdded
  );

  // 0x150b7a02 == bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

  // The fee relative to keyPrice to charge when transfering a Key to another account
  // (potentially on a 0x marketplace).
  // This is calculated as `keyPrice * transferFeeBasisPoints / BASIS_POINTS_DEN`.
  uint public transferFeeBasisPoints;

  /**
  * @notice Allows the key owner to share their key (parent key) by
  * transferring a portion of the remaining time to a new key (child key).
  * @param _from The owner of the parent key
  * @param _to The recipient of the shared key
  * @param _tokenId the key to share
  * @param _timeShared The amount of time shared
  */
  function shareKey(
    address _from,
    address _to,
    uint _tokenId,
    uint _timeShared
  ) public
    onlyIfAlive
    hasValidKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_to != address(0), 'INVALID_ADDRESS');

    Key storage fromKey = keyByOwner[_from];
    Key storage toKey = keyByOwner[_to];
    uint iDTo = toKey.tokenId;
    uint time;
    // get the remaining time for the origin key
    uint timeRemaining = fromKey.expirationTimestamp - block.timestamp;
    // get the transfer fee
    uint fee = getTransferFee(_from, _timeShared);

    // ensure that we don't try to share too much
    if(_timeShared.add(fee) < timeRemaining) {
      time = _timeShared;
      uint timePlusFee = _timeShared.add(fee);
      // deduct time from parent key, including transfer fee
      _timeMachine(_tokenId, timePlusFee, false);
    } else {
      fee = getTransferFee(_from, timeRemaining);
      time = timeRemaining.sub(fee);
      fromKey.expirationTimestamp = block.timestamp; // Effectively expiring the key
      emit ExpireKey(_tokenId);
    }

    if (toKey.tokenId == 0) {
      _assignNewTokenId(toKey);
      _recordOwner(_to, iDTo);
      emit Transfer(
        address(0), // This is a creation or time-sharing
        _to,
        iDTo
      );
    }
    // add time to new key
    _timeMachine(iDTo, time, true);
    // trigger event
    emit Transfer(
      _from,
      _to,
      iDTo
    );
  }

  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
    onlyIfAlive
    hasValidKey(_from)
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(_recipient != address(0), 'INVALID_ADDRESS');
    uint fee = getTransferFee(_from, 0);

    Key storage fromKey = keyByOwner[_from];
    Key storage toKey = keyByOwner[_recipient];
    uint id = fromKey.tokenId;

    uint previousExpiration = toKey.expirationTimestamp;
    // subtract the fee from the senders key before the transfer
    _timeMachine(id, fee, false);

    if (toKey.tokenId == 0) {
      toKey.tokenId = fromKey.tokenId;
      _recordOwner(_recipient, toKey.tokenId);
    }

    if (previousExpiration <= block.timestamp) {
      // The recipient did not have a key, or had a key but it expired. The new expiration is the
      // sender's key expiration
      // an expired key is no longer a valid key, so the new tokenID is the sender's tokenID
      toKey.expirationTimestamp = fromKey.expirationTimestamp;
      toKey.tokenId = fromKey.tokenId;
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
    external
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
    onlyIfAlive
    onlyKeyOwnerOrApproved(_tokenId)
    hasValidKey(ownerOf[_tokenId])
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
   * @param _owner The owner of the key check the transfer fee for.
   */
  function getTransferFee(
    address _owner,
    uint _time
  )
    public view
    hasValidKey(_owner)
    returns (uint)
  {
    Key storage key = keyByOwner[_owner];
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
  * @notice Modify the expirationTimestamp of a key
  * by a given amount.
  * @param _tokenId The ID of the key to modify.
  * @param _deltaT The amount of time in seconds by which
  * to modify the keys expirationTimestamp
  * @param _addTime Choose whether to increase or decrease
  * expirationTimestamp (false == decrease, true == increase)
  * @dev Throws if owner does not have a valid key.
  */
  function _timeMachine(
    uint _tokenId,
    uint256 _deltaT,
    bool _addTime
  ) internal
  {
    address tokenOwner = ownerOf[_tokenId];
    require(tokenOwner != address(0), 'NON_EXISTENT_KEY');
    Key storage key = keyByOwner[tokenOwner];
    uint formerTimestamp = key.expirationTimestamp;
    bool validKey = getHasValidKey(tokenOwner);
    if(_addTime) {
      if(validKey) {
        key.expirationTimestamp = formerTimestamp.add(_deltaT);
      } else {
        key.expirationTimestamp = block.timestamp.add(_deltaT);
      }
    } else {
      key.expirationTimestamp = formerTimestamp.sub(_deltaT);
    }
    emit TimestampChanged(_tokenId, _deltaT, _addTime);
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