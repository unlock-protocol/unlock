pragma solidity 0.5.16;

import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';


contract MixinSignatures
{
  /// @notice emits anytime the nonce used for off-chain approvals changes.
  event NonceChanged(
    address indexed keyOwner,
    uint nextAvailableNonce
  );

  // Stores a nonce per user to use for signed messages
  mapping(address => uint) public keyOwnerToNonce;

  /// @notice Validates an off-chain approval signature.
  /// @dev If valid the nonce is consumed, else revert.
  modifier consumeOffchainApproval(
    bytes32 _hash,
    address _keyOwner,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  )
  {
    require(
      ecrecover(
        ECDSA.toEthSignedMessageHash(_hash),
        _v,
        _r,
        _s
      ) == _keyOwner, 'INVALID_SIGNATURE'
    );
    keyOwnerToNonce[_keyOwner]++;
    emit NonceChanged(_keyOwner, keyOwnerToNonce[_keyOwner]);
    _;
  }

  /**
   * @notice Sets the minimum nonce for a valid off-chain approval message from the
   * senders account.
   * @dev This can be used to invalidate a previously signed message.
   */
  function invalidateOffchainApproval(
    uint _nextAvailableNonce
  ) external
  {
    require(_nextAvailableNonce > keyOwnerToNonce[msg.sender], 'NONCE_ALREADY_USED');
    keyOwnerToNonce[msg.sender] = _nextAvailableNonce;
    emit NonceChanged(msg.sender, _nextAvailableNonce);
  }
}