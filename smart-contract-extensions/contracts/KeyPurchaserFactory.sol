// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import './KeyPurchaser.sol';
import './utils/Clone2Factory.sol';
import './utils/Clone2Probe.sol';
import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';

/**
 * @notice A factory for creating keyPurchasers.
 * @dev This contract acts as a registry to discover purchasers for a lock
 * and by creating each purchaser itself, it's a single tx to deploy and initialize and this guarantees
 * a consistent implementation and that it was created by the lock owner.
 */
contract KeyPurchaserFactory
{
  using Clone2Factory for address;
  using Clone2Probe for address;

  event KeyPurchaserCreated(address indexed forLock, address indexed keyPurchaser);

  /**
   * @notice The implementation for minimal proxies to use.
   */
  address public keyPurchaserTemplate;

  /**
   * @notice The registry of available keyPurchases for a given lock.
   */
  mapping(address => address[]) public lockToKeyPurchasers;

  constructor()
  {
    keyPurchaserTemplate = address(new KeyPurchaser());
  }

  function _getClone2Salt(
    IPublicLockV8 _lock,
    uint _maxKeyPrice,
    uint _renewWindow,
    uint _renewMinFrequency,
    uint _msgSenderReward,
    uint _nonce
  ) private pure
    returns (bytes32)
  {
    return keccak256(abi.encodePacked(address(_lock), _maxKeyPrice, _renewWindow, _renewMinFrequency, _msgSenderReward, _nonce));
  }

  /**
   * @notice Returns the address for a keyPurchaser given the terms.
   * @dev This works whether or not the keyPurchaser has actually been deployed yet.
   */
  function getExpectedAddress(
    IPublicLockV8 _lock,
    uint _maxKeyPrice,
    uint _renewWindow,
    uint _renewMinFrequency,
    uint _msgSenderReward,
    uint _nonce
  ) external view
    returns (address)
  {
    bytes32 salt = _getClone2Salt(_lock, _maxKeyPrice, _renewWindow, _renewMinFrequency, _msgSenderReward, _nonce);
    return keyPurchaserTemplate.getClone2Address(salt);
  }

  /**
   * @notice Deploys a new KeyPurchaser for a lock and stores the address for reference.
   * @param _nonce Allows a KeyPurchaser to be redeployed with a different address in case the original
   * was incorrectly stopped. Typically this should be set to 0.
   * @dev See KeyPurchaser for a description of the other params.
   */
  function deployKeyPurchaser(
    IPublicLockV8 _lock,
    uint _maxKeyPrice,
    uint _renewWindow,
    uint _renewMinFrequency,
    uint _msgSenderReward,
    uint _nonce
  ) public
  {
    bytes32 salt = _getClone2Salt(_lock, _maxKeyPrice, _renewWindow, _renewMinFrequency, _msgSenderReward, _nonce);
    address purchaser = keyPurchaserTemplate.createClone2(salt);

    KeyPurchaser(purchaser).initialize(_lock, _maxKeyPrice, _renewWindow, _renewMinFrequency, _msgSenderReward);
    lockToKeyPurchasers[address(_lock)].push(purchaser);
    emit KeyPurchaserCreated(address(_lock), purchaser);
  }

  /**
   * @notice Returns all the KeyPurchasers for a given lock.
   * @dev Some KeyPurchasers in this list may have been disabled or stopped.
   */
  function getKeyPurchasers(
    address _lock
  ) public view
    returns (address[] memory)
  {
    return lockToKeyPurchasers[_lock];
  }

  /**
   * @notice Returns the number of available keyPurchasers for a given lock.
   */
  function getKeyPurchaserCount(
    address _lock
  ) public view
    returns (uint)
  {
    return lockToKeyPurchasers[_lock].length;
  }
}
