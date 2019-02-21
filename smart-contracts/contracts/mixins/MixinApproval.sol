pragma solidity 0.4.25;

import '../interfaces/IERC721.sol';
import './MixinDisableAndDestroy.sol';
import './MixinKeyOwner.sol';


/**
 * @title Mixin for the Approval related functions needed to meet the ERC721 
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply 
 * separates logically groupings of code to ease readability. 
 */
contract MixinApproval is
  IERC721,
  MixinDisableAndDestroy,
  MixinKeyOwner
{
  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transfered
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved beneficiary
  // Note 2: for transfer, both addresses will be different
  // Note 3: for sales (new keys on restricted locks), both addresses will be the same
  mapping (uint => address) private approved;

  // Ensure that the caller has a key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyOwnerOrApproved(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender) ||
      _getApproved(_tokenId) == msg.sender,
      'ONLY_KEY_OWNER_OR_APPROVED');
    _;
  }

  /**
   * This approves _approved to get ownership of _tokenId.
   * Note: that since this is used for both purchase and transfer approvals
   * the approved token may not exist.
   */
  function approve(
    address _approved,
    uint _tokenId
  )
    external
    payable
    onlyIfAlive
    onlyKeyOwner(_tokenId)
  {
    require(_approved != address(0), 'INVALID_ADDRESS');
    require(msg.sender != _approved, 'APPROVE_SELF');

    approved[_tokenId] = _approved;
    emit Approval(ownerOf(_tokenId), _approved, _tokenId);
  }

  /**
   * external version
   * Will return the approved recipient for a key, if any.
   */
  function getApproved(
    uint _tokenId
  )
    external
    view
    returns (address)
  {
    return _getApproved(_tokenId);
  }

  /**
   * Will return the approved recipient for a key transfer or ownership.
   * Note: this does not check that a corresponding key
   * actually exists.
   */
  function _getApproved(
    uint _tokenId
  )
    internal
    view
    returns (address)
  {
    address approvedRecipient = approved[_tokenId];
    require(approvedRecipient != address(0), 'NONE_APPROVED');
    return approvedRecipient;
  }

  /**
   * @dev Function to clear current approval of a given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   */
  function _clearApproval(
    uint256 _tokenId
  ) internal
  {
    if (approved[_tokenId] != address(0)) {
      approved[_tokenId] = address(0);
    }
  }
}
