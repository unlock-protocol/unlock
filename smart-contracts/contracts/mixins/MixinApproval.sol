pragma solidity 0.5.16;

import './MixinDisable.sol';
import './MixinKeys.sol';


/**
 * @title Mixin for the Approval related functions needed to meet the ERC721
 * standard.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinApproval is
  MixinDisable,
  MixinKeys
{
  // Keeping track of approved transfers
  // This is a mapping of addresses which have approved
  // the transfer of a key to another address where their key can be transferred
  // Note: the approver may actually NOT have a key... and there can only
  // be a single approved address
  mapping (uint => address) private approved;

  // Keeping track of approved operators for a given Key manager.
  // This approves a given operator for all keys managed by the calling "keyManager"
  // The caller may not currently be the keyManager for ANY keys.
  // These approvals are never reset/revoked automatically, unlike "approved",
  // which is reset on transfer.
  mapping (address => mapping (address => bool)) private managerToOperatorApproved;

  // Ensure that the caller is the keyManager of the key
  // or that the caller has been approved
  // for ownership of that key
  modifier onlyKeyManagerOrApproved(
    uint _tokenId
  )
  {
    require(
      isKeyManager(_tokenId, msg.sender) ||
      _isApproved(_tokenId, msg.sender) ||
      isApprovedForAll(_ownerOf[_tokenId], msg.sender),
      'ONLY_KEY_MANAGER_OR_APPROVED'
    );
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
    public
    onlyIfAlive
    onlyKeyManagerOrApproved(_tokenId)
  {
    require(msg.sender != _approved, 'APPROVE_SELF');

    approved[_tokenId] = _approved;
    emit Approval(_ownerOf[_tokenId], _approved, _tokenId);
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
  ) public
    onlyIfAlive
  {
    require(_to != msg.sender, 'APPROVE_SELF');
    managerToOperatorApproved[msg.sender][_to] = _approved;
    emit ApprovalForAll(msg.sender, _to, _approved);
  }

  /**
   * Will return the approved recipient for a key, if any.
   */
  function getApproved(
    uint _tokenId
  ) public view
    returns (address)
  {
    address approvedRecipient = approved[_tokenId];
    require(approvedRecipient != address(0), 'NONE_APPROVED');
    return approvedRecipient;
  }

  /**
   * @dev Tells whether an operator is approved by a given owner
   * @param _keyOwner owner address which you want to query the approval of
   * @param _operator operator address which you want to query the approval of
   * @return bool whether the given operator is approved by the given owner
   */
  function isApprovedForAll(
    address _keyOwner,
    address _operator
  ) public view
    returns (bool)
  {
    return ownerToOperatorApproved[_keyOwner][_operator];
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
