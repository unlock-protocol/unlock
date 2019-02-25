pragma solidity 0.4.25;

import './MixinDisableAndDestroy.sol';
import './MixinApproval.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import 'openzeppelin-solidity/contracts/utils/Address.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title Mixin for the safe transfer related functions needed to meet the ERC721
 * standard.
 * @author Nick Furfaro
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is
  MixinApproval,
  MixinKeys,
  MixinLockCore {
  using SafeMath for uint;
  using Address for address;

  bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

  /**
   * This is payable because at some point we want to allow the LOCK to capture a fee on 2ndary
   * market transactions...
   */
  function transferFrom(
    address _from,
    address _recipient,
    uint _tokenId
  )
    public
    payable
    onlyIfAlive
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
    payable
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
    bytes _data
  )
    public
    payable
    onlyIfAlive
    onlyKeyOwnerOrApproved(_tokenId)
    hasValidKey(ownerOf(_tokenId))
  {
    transferFrom(_from, _to, _tokenId);
    require(_checkOnERC721Received(_from, _to, _tokenId, _data), 'NO_FALLBACK');

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
    return bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'));
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
    bytes _data
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