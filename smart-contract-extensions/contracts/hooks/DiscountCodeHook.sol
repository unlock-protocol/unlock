pragma solidity 0.5.17;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/access/roles/WhitelistAdminRole.sol';
import 'unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import 'unlock-abi-7/IPublicLockV7.sol';

/**
 * @notice Used with a Lock to offer discounts if the user enters a code.
 */
contract DiscountCodeHook is ILockKeyPurchaseHookV7, WhitelistAdminRole
{
  using SafeMath for uint;

  /**
   * @notice The code expressed as an address where the private key is
   * keccak256(abi.encode(code, lock.address)).
   * The discount is in basis points, so 1000 == 10%
   */
  mapping(address => uint) public codeAddressToDiscountBasisPoints;

  /**
   * @notice Allows an admin to add or remove discount codes.
   * @dev To remove a code, just set the discount to 0.
   */
  function addCodes(
    address[] calldata _codeAddresses,
    uint[] calldata _discounts
  ) external
    onlyWhitelistAdmin()
  {
    for(uint i = 0; i < _codeAddresses.length; i++)
    {
      address codeAddress = _codeAddresses[i];
      require(codeAddress != address(0), 'INVALID_CODE');
      codeAddressToDiscountBasisPoints[codeAddress] = _discounts[i];
    }
  }

  /**
   * @notice Returns the price per key after considering the code entered.
   * If the code is missing or incorrect, the lock's normal keyPrice will be used.
   * @param _recipient the account which will be granted a key
   * @param _data arbitrary data populated by the front-end which initiated the sale
   */
  function keyPurchasePrice(
    address /*from*/,
    address _recipient,
    address /*referrer*/,
    bytes calldata _data
  ) external view
    returns (uint minKeyPrice)
  {
    bytes32 secretHash = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_recipient)));
    address codeAddress = ECDSA.recover(secretHash, _data);
    uint discountBP = codeAddressToDiscountBasisPoints[codeAddress];
    minKeyPrice = IPublicLockV7(msg.sender).keyPrice();
    if(discountBP > 0)
    {
      uint discount = minKeyPrice.mul(discountBP).div(10000);
      minKeyPrice = minKeyPrice.sub(discount);
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
  ) external
  {
    // no-op
  }
}
