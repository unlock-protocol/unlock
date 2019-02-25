pragma solidity 0.4.25;

import '../interfaces/IERC721.sol';
import './mixins/MixinDisableAndDestroy.sol';
import "../../AddressUtils.sol";

/**
 * @title Mixin for the safe transfer related functions needed to meet the ERC721
 * standard.
 * @author Nick Furfaro
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */

contract MixinTransfer is IERC721 {
  using AddressUtils for address;

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
    onlyIfAlive
    onlyKeyOwnerOrApproved(_tokenId)
  {

  }

  /**
  * @notice Transfers the ownership of an NFT from one address to another address
  * @param _from The current owner of the NFT
  * @param _to The new owner
  * @param _tokenId The NFT to transfer
  * @param data Additional data with no specified format, sent in call to `_to`
  */
  function safeTransferFrom(
    address _from,
    address _to,
    uint _tokenId,
    bytes data
  )
    external
    payable
    onlyIfAlive
    onlyKeyOwnerOrApproved(_tokenId)
    hasValidKey(ownerOf(_tokenId))
  {
    require(isKeyOwner(_tokenId, _from), 'ONLY_KEY_OWNER');
    require(_recipient != address(0), 'INVALID_ADDRESS');
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
   * @dev Internal function to invoke `onERC721Received` on a target address
   * @dev The call is not executed if the target address is not a contract
   * @param _from address representing the previous owner of the given token ID
   * @param _to target address that will receive the tokens
   * @param _tokenId uint256 ID of the token to be transferred
   * @param _data bytes optional data to send along with the call
   * @return whether the call correctly returned the expected magic value
   */
  function checkAndCallSafeTransfer(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes _data
  )
    internal
    returns (bool)
  {
    if (!_to.isContract()) {
      return true;
    }
    bytes4 retval = ERC721Receiver(_to).onERC721Received(
      _from, _tokenId, _data);
    return (retval == ERC721_RECEIVED);
  }

}