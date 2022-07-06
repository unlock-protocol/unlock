// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@unlock-protocol/contracts/dist/Hooks/ILockKeyPurchaseHook.sol';
import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';
import '../mixins/LockRoles.sol';


/**
 * @notice Used with a Lock in order to require the user knows
 * a code in order to buy.
 * @dev One instance of this contract may be used for all v7 locks.
 */
contract CodeRequiredHook is ILockKeyPurchaseHook, LockRoles
{
  /**
   * @notice The code expressed as an address where the private key is
   * keccak256(abi.encode(code, lock.address))
   */
  mapping(address => mapping(address => bool)) public lockToCodeAddress;

  /**
   * @notice Allows the lock manager to add one or more codes.
   */
  function addCodes(
    IPublicLockV8 _lock,
    address[] calldata _codeAddresses
  ) external
    onlyLockManager(_lock)
  {
    for(uint i = 0; i < _codeAddresses.length; i++)
    {
      require(_codeAddresses[i] != address(0), 'INVALID_CODE');
      lockToCodeAddress[address(_lock)][_codeAddresses[i]] = true;
    }
  }

  /**
   * @notice Allows the lock manager to remove one or more codes.
   */
  function removeCodes(
    IPublicLockV8 _lock,
    address[] calldata _codeAddresses
  ) external
    onlyLockManager(_lock)
  {
    for(uint i = 0; i < _codeAddresses.length; i++)
    {
      require(_codeAddresses[i] != address(0), 'INVALID_CODE');
      lockToCodeAddress[address(_lock)][_codeAddresses[i]] = false;
    }
  }

  /**
   * @notice Returns the price per key which is unaffected by this hook.
   */
  function keyPurchasePrice(
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/
  ) external override view
    returns (uint minKeyPrice)
  {
    return IPublicLockV8(msg.sender).keyPrice();
  }

  /**
   * @notice Confirms the correct code was entered in order to purchase a key.
   * @param _recipient the account which will be granted a key
   * @param _data arbitrary data populated by the front-end which initiated the sale
   */
  function onKeyPurchase(
    address /*from*/,
    address _recipient,
    address /*referrer*/,
    bytes calldata _data,
    uint /*minKeyPrice*/,
    uint /*pricePaid*/
  ) external view override
  {
    // Confirm `_to` (the new keyOwner)
    bytes32 secretMessage = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_recipient)));
    require(lockToCodeAddress[msg.sender][ECDSA.recover(secretMessage, _data)], 'INCORRECT_CODE');
  }
}
