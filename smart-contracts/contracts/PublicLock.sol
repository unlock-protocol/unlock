pragma solidity 0.5.11;

import './interfaces/IERC721.sol';
import './interfaces/IERC721Enumerable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/introspection/ERC165.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
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
  Initializable,
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
  function initialize(
    address _owner,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string memory _lockName
  ) public
    initializer()
  {
    Ownable.initialize(_owner);
    MixinFunds.initialize(_tokenAddress);
    MixinDisableAndDestroy.initialize();
    MixinLockCore.initialize(_owner, _expirationDuration, _keyPrice, _maxNumberOfKeys);
    MixinLockMetadata.initialize(_lockName);
    MixinERC721Enumerable.initialize();
    MixinRefunds.initialize();
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
  }

  // The version number of the current implementation on this network
  function publicLockVersion(
  ) external pure
    returns (uint16)
  {
    return 5;
  }
}
