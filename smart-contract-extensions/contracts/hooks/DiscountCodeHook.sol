// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@unlock-protocol/contracts/dist/Hooks/ILockKeyPurchaseHook.sol';
import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV8sol8.sol';
import '../mixins/LockRoles.sol';


/**
 * @notice Used with a Lock to offer discounts if the user enters a code.
 * @dev One instance of this contract may be used for all v7 locks.
 */
contract DiscountCodeHook is ILockKeyPurchaseHook, LockRoles
{
  using SafeMath for uint;

  event AddCode(address indexed lock, address codeAddress, uint discountBasisPoints);

  /**
   * @notice The code expressed as an address where the private key is
   * keccak256(abi.encode(code, lock.address)).
   * The discount is in basis points, so 1000 == 10%
   */
  mapping(address => mapping(address => uint)) public lockToCodeAddressToDiscountBasisPoints;

  /**
   * @notice Allows a lock manager to add or remove discount codes.
   * @dev To remove a code, just set the discount to 0.
   */
  function addCodes(
    IPublicLockV8 _lock,
    address[] calldata _codeAddresses,
    uint[] calldata _discountBasisPoints
  ) external
    onlyLockManager(_lock)
  {
    for(uint i = 0; i < _codeAddresses.length; i++)
    {
      address codeAddress = _codeAddresses[i];
      require(codeAddress != address(0), 'INVALID_CODE');
      uint discountBasisPoints = _discountBasisPoints[i];
      lockToCodeAddressToDiscountBasisPoints[address(_lock)][codeAddress] = discountBasisPoints;
      emit AddCode(address(_lock), codeAddress, discountBasisPoints);
    }
  }

  /**
   * @notice Returns the price per key after considering the code entered.
   * If the code is missing or incorrect, the lock's normal keyPrice will be used.
   * @param _recipient the account which will be granted a key
   * @param _signature the signature created from the code's private key, signing
   * the message `"\x19Ethereum Signed Message:\n32" + keccak256(_recipient)`.
   * This is passed through the lock by setting the `_data` field on purchase.
   */
  function keyPurchasePrice(
    address /*from*/,
    address _recipient,
    address /*referrer*/,
    bytes calldata _signature
  ) external override view
    returns (uint minKeyPrice)
  {
    minKeyPrice = IPublicLockV8(msg.sender).keyPrice();
    if(_signature.length == 65)
    {
      bytes32 secretMessage = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_recipient)));
      address codeAddress = ECDSA.recover(secretMessage, _signature);
      uint discountBP = lockToCodeAddressToDiscountBasisPoints[msg.sender][codeAddress];
      if(discountBP > 0)
      {
        uint discount = minKeyPrice.mul(discountBP).div(10000);
        minKeyPrice = minKeyPrice.sub(discount);
      }
    }
  }

  /**
   * @notice This function allows the hook to reject purchases, but that's
   * not applicable for this use case.
   */
  function onKeyPurchase(
    address /*from*/,
    address /*_recipient*/,
    address /*referrer*/,
    bytes calldata /*_data*/,
    uint /*minKeyPrice*/,
    uint /*pricePaid*/
  ) external override
  {
    // no-op
  }
}
