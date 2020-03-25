pragma solidity 0.5.17;


import './interfaces/IPublicLock.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/introspection/ERC165.sol';
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
  Initializable,
  ERC165,
  MixinLockManagerRole,
  MixinKeyGranterRole,
  MixinSignatures,
  MixinFunds,
  MixinDisable,
  MixinLockCore,
  MixinKeys,
  MixinLockMetadata,
  MixinERC721Enumerable,
  MixinGrantKeys,
  MixinPurchase,
  MixinTransfer,
  MixinRefunds
{
  function initialize(
    address _lockCreator,
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string memory _lockName
  ) public
    initializer()
  {
    MixinFunds._initializeMixinFunds(_tokenAddress);
    MixinDisable._initializeMixinDisable();
    MixinLockCore._initializeMixinLockCore(_lockCreator, _expirationDuration, _keyPrice, _maxNumberOfKeys);
    MixinLockMetadata._initializeMixinLockMetadata(_lockName);
    MixinERC721Enumerable._initializeMixinERC721Enumerable();
    MixinRefunds._initializeMixinRefunds();
    MixinLockManagerRole._initializeMixinLockManagerRole(_lockCreator);
    MixinKeyGranterRole._initializeMixinKeyGranterRole(_lockCreator);
    // registering the interface for erc721 with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x80ac58cd);
  }

  /**
   * @notice Allow the contract to accept tips in ETH sent directly to the contract.
   * @dev This is okay to use even if the lock is priced in ERC-20 tokens
   */
  function() external payable {}
}
