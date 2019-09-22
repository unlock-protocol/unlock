pragma solidity 0.5.10;

import '../interfaces/IERC721.sol';
import './MixinDisableAndDestroy.sol';
import './MixinKeys.sol';


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
  MixinKeys
{
  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transfered
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved beneficiary
  // Note 2: for transfer, both addresses will be different
  // Note 3: for sales (new keys on restricted locks), both addresses will be the same
  mapping (uint => address) private approved;

  // Keeping track of approved operators for a Key owner.
  // Since an owner can have up to 1 Key, this is similiar to above
  // but the approval does not reset when a transfer occurs.
  mapping (address => mapping (address => bool)) private ownerToOperatorApproved;

  // Ensure that the caller has a key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyOwnerOrApproved(
    uint _tokenId
  ) {
    require(
      isKeyOwner(_tokenId, msg.sender) ||
        _isApproved(_tokenId, msg.sender) ||
        isApprovedForAll(ownerOf[_tokenId], msg.sender),
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
    onlyKeyOwnerOrApproved(_tokenId)
  {
    require(msg.sender != _approved, 'APPROVE_SELF');

    approved[_tokenId] = _approved;
    emit Approval(ownerOf[_tokenId], _approved, _tokenId);
  }

  /**
   * @dev Sets or unsets the approval of a given operator
   * An operator is allowed to transfer all tokens of the sender on their behalf
   * @param _to operator address to set the approval
   * @param _approved representing the status of the approval to be set
   */
  function setApprovalForAll(
    address _to,
    bool _approved
  ) external
    onlyIfAlive
  {
    require(_to != msg.sender, 'APPROVE_SELF');
    ownerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
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
   * @dev Tells whether an operator is approved by a given owner
   * @param _owner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(
    address _owner,
    address _operator
  ) public view
    returns (bool)
  {
    return ownerToOperatorApproved[_owner][_operator];
  }

  /**
   * @dev Checks if the given user is approved to transfer the tokenId.
   */
  function _isApproved(
    uint _tokenId,
    address _user
  ) internal view
    returns (bool)
  {
    return approved[_tokenId] == _user;
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
