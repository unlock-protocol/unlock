// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinRoles.sol';
import './MixinDisable.sol';
import './MixinKeys.sol';
import './MixinFunds.sol';
import './MixinLockCore.sol';
import './MixinPurchase.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';

/**
 * @title Mixin for the transfer-related functions needed to meet the ERC721
 * standard.
 * @author Nick Furfaro
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is
  MixinRoles,
  MixinFunds,
  MixinLockCore,
  MixinKeys,
  MixinPurchase
{
  using AddressUpgradeable for address;

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
  * @notice Allows the key owner to safely transfer a portion of the remaining time 
  * from their key to a new key
  * @param _tokenIdFrom the key to share
  * @param _to The recipient of the shared time
  * @param _timeShared The amount of time shared
  */
  function shareKey(
    address _to,
    uint _tokenIdFrom,
    uint _timeShared
  ) public
  {
    _lockIsUpToDate();
    require(maxNumberOfKeys > _totalSupply, 'LOCK_SOLD_OUT');
    _onlyKeyManagerOrApproved(_tokenIdFrom);
    _isValidKey(_tokenIdFrom);
    require(transferFeeBasisPoints < BASIS_POINTS_DEN, 'KEY_TRANSFERS_DISABLED');
    require(_to != address(0), 'INVALID_ADDRESS');
    address keyOwner = _ownerOf[_tokenIdFrom];
    require(keyOwner != _to, 'TRANSFER_TO_SELF');

    // store time to be added
    uint time;

    // get the remaining time for the origin key
    uint timeRemaining = keyExpirationTimestampFor(_tokenIdFrom) - block.timestamp;

    // get the transfer fee based on amount of time wanted share
    uint fee = getTransferFee(_tokenIdFrom, _timeShared);
    uint timePlusFee = _timeShared + fee;

    // ensure that we don't try to share too much
    if(timePlusFee < timeRemaining) {
      // now we can safely set the time
      time = _timeShared;
      // deduct time from parent key, including transfer fee
      _timeMachine(_tokenIdFrom, timePlusFee, false);
    } else {
      // we have to recalculate the fee here
      fee = getTransferFee(_tokenIdFrom, timeRemaining);
      time = timeRemaining - fee;
      _keys[_tokenIdFrom].expirationTimestamp = block.timestamp; // Effectively expiring the key
      emit ExpireKey(_tokenIdFrom);
    }

    // create new key
    uint tokenIdTo = _createNewKey(
      _to,
      address(0),
      block.timestamp + time
    );
    
    // trigger event
    emit Transfer(
      keyOwner,
      _to,
      tokenIdTo
    );

    require(_checkOnERC721Received(keyOwner, _to, tokenIdTo, ''), 'NON_COMPLIANT_ERC721_RECEIVER');
  }


  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
  {
    _isValidKey(_tokenId);
    _onlyKeyManagerOrApproved(_tokenId);
    require(ownerOf(_tokenId) == _from, 'TRANSFER_FROM: NOT_KEY_OWNER');
    require(transferFeeBasisPoints < BASIS_POINTS_DEN, 'KEY_TRANSFERS_DISABLED');
    require(_recipient != address(0), 'INVALID_ADDRESS');
    require(_from != _recipient, 'TRANSFER_TO_SELF');

    // subtract the fee from the senders key before the transfer
    _timeMachine(_tokenId, getTransferFee(_tokenId, 0), false);  

    // transfer a token
    Key storage key = _keys[_tokenId];

    // update expiration
    key.expirationTimestamp = keyExpirationTimestampFor(_tokenId);

    // increase total number of unique owners
    if(balanceOf(_recipient) == 0 ) {
      numberOfOwners++;
    }

    // delete token from previous owner
    _deleteOwnershipRecord(_tokenId);
    
    // record new owner
    _createOwnershipRecord(_tokenId, _recipient);

    // clear any previous approvals
    _setKeyManagerOf(_tokenId, address(0));
    _clearApproval(_tokenId);

    // make future reccuring transactions impossible
    _originalDurations[_tokenId] = 0;

    // trigger event
    emit Transfer(
      _from,
      _recipient,
      _tokenId
    );
  }

  /**
   * @notice An ERC-20 style transfer.
   * @param _tokenId the Id of the token to send
   * @param _to the destination address
   * @param _valueBasisPoint a percentage (expressed as basis points) of the time to be transferred
   * @return success bool success/failure of the transfer
   */
  function transfer(
    uint _tokenId,
    address _to,
    uint _valueBasisPoint
  ) public
    returns (bool success)
  {
    _isValidKey(_tokenId);
    uint timeShared = ( keyExpirationTimestampFor(_tokenId) - block.timestamp ) * _valueBasisPoint / BASIS_POINTS_DEN;
    shareKey( _to, _tokenId, timeShared);
    // Errors will cause a revert
    return true;
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
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   * @notice disabled when transfers are disabled
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) public
  {
    require(_to != msg.sender, 'APPROVE_SELF');
    require(transferFeeBasisPoints < BASIS_POINTS_DEN, 'KEY_TRANSFERS_DISABLED');
    managerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
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
  ) external {
    _onlyLockManager();
    emit TransferFeeChanged(
      _transferFeeBasisPoints
    );
    transferFeeBasisPoints = _transferFeeBasisPoints;
  }

  /**
   * Determines how much of a fee would need to be paid in order to
   * transfer to another account.  This is pro-rated so the fee goes 
   * down overtime.
   * @dev Throws if _tokenId is not have a valid key
   * @param _tokenId The id of the key check the transfer fee for.
   * @param _time The amount of time to calculate the fee for.
   * @return The transfer fee in seconds.
   */
  function getTransferFee(
    uint _tokenId,
    uint _time
  )
    public view
    returns (uint)
  {
    _isKey(_tokenId);
    uint expirationTimestamp = keyExpirationTimestampFor(_tokenId);
    if(expirationTimestamp < block.timestamp) {
      return 0;
    } else {
      uint timeToTransfer;
      if(_time == 0) {
        timeToTransfer = expirationTimestamp - block.timestamp;
      } else {
        timeToTransfer = _time;
      }
      return timeToTransfer * transferFeeBasisPoints / BASIS_POINTS_DEN;
    }
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
    bytes4 retval = IERC721ReceiverUpgradeable(to).onERC721Received(
      msg.sender, from, tokenId, _data);
    return (retval == _ERC721_RECEIVED);
  }

  uint256[1000] private __safe_upgrade_gap;
}