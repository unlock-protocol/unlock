pragma solidity 0.5.11;

import './interfaces/IERC721.sol';
import './interfaces/IERC721Enumerable.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'openzeppelin-eth/contracts/introspection/ERC165.sol';
import './mixins/MixinApproval.sol';
import './mixins/MixinDisableAndDestroy.sol';
import './mixins/MixinERC721Enumerable.sol';
import './mixins/MixinEventHooks.sol';
import './mixins/MixinFunds.sol';
import './mixins/MixinGrantKeys.sol';
import './mixins/MixinKeys.sol';
import './mixins/MixinLockCore.sol';
import './mixins/MixinLockMetadata.sol';
import './mixins/MixinPurchase.sol';
import './mixins/MixinRefunds.sol';
import './mixins/MixinTransfer.sol';

/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://eips.ethereum.org/EIPS/eip-721
 */
contract PublicLock is
  IERC721Enumerable,
  IERC721,
  ERC165,
  Ownable,
  MixinFunds,
  MixinDisableAndDestroy,
  MixinLockCore,
  MixinKeys,
  MixinLockMetadata,
  MixinERC721Enumerable,
  MixinEventHooks,
  MixinGrantKeys,
  MixinPurchase,
  MixinApproval,
  MixinTransfer,
  MixinRefunds
{
  constructor(
    address _owner,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string memory _lockName
  )
    public
    MixinFunds(_tokenAddress)
    MixinLockCore(_owner, _expirationDuration, _keyPrice, _maxNumberOfKeys)
    MixinLockMetadata(_lockName)
  {
    ERC165.initialize();
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
    // We must manually initialize Ownable.sol
    Ownable.initialize(_owner);
  }

  // The version number of the current implementation on this network
  function publicLockVersion(
  ) external pure
    returns (uint16)
  {
    return 5;
  }
}
