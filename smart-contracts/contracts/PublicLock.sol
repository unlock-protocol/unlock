pragma solidity 0.5.16;


import './interfaces/IPublicLock.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/introspection/ERC165.sol';
import './mixins/MixinApproval.sol';
import './mixins/MixinDisable.sol';
import './mixins/MixinERC721Enumerable.sol';
import './mixins/MixinFunds.sol';
import './mixins/MixinGrantKeys.sol';
import './mixins/MixinKeys.sol';
import './mixins/MixinLockCore.sol';
import './mixins/MixinLockMetadata.sol';
import './mixins/MixinPurchase.sol';
import './mixins/MixinRefunds.sol';
import './mixins/MixinTransfer.sol';
import './mixins/MixinSignatures.sol';
import './mixins/MixinLockManagerRole.sol';
import './mixins/MixinKeyGranterRole.sol';


/**
 * @title The Lock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @dev ERC165 allows our contract to be queried to determine whether it implements a given interface.
 * Every ERC-721 compliant contract must implement the ERC165 interface.
 * https://eips.ethereum.org/EIPS/eip-721
 */
contract PublicLock is
  IPublicLock,
  ERC165,
  Ownable,
  MixinSignatures,
  MixinFunds,
  MixinDisable,
  MixinLockManagerRole,
  MixinLockCore,
  MixinKeys,
  MixinKeyGranterRole,
  MixinLockMetadata,
  MixinERC721Enumerable,
  MixinGrantKeys,
  MixinPurchase,
  MixinApproval,
  MixinTransfer,
  MixinRefunds
{
  function initialize(
    address _lockOwner,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string memory _lockName
  ) public
    initializer()
  {
    Ownable.initialize(_lockOwner);
    MixinFunds._initializeMixinFunds(_tokenAddress);
    MixinDisable._initializeMixinDisable();
    MixinLockCore._initializeMixinLockCore(_lockOwner, _expirationDuration, _keyPrice, _maxNumberOfKeys);
    MixinLockMetadata._initializeMixinLockMetadata(_lockName);
    MixinERC721Enumerable._initializeMixinERC721Enumerable();
    MixinRefunds._initializeMixinRefunds();
    MixinLockManagerRole._initializeMixinLockManagerRole(_lockOwner);
    MixinKeyGranterRole._initializeMixinKeyGranterRole(_lockOwner);
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
  }
}
