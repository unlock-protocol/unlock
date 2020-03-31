pragma solidity 0.5.17;

import '@openzeppelin/contracts/cryptography/ECDSA.sol';
import 'unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import 'unlock-abi-7/IPublicLockV7.sol';

/**
 * @notice Used with a Lock in order to require the user knows
 * a code in order to buy.
 * @dev Set this contract as the beneficiary of the lock.
 */
contract CodeRequiredHook is ILockKeyPurchaseHookV7
{
  /**
   * @notice The answer expressed as an address where the private key is
   * keccak256(abi.encode(answer, lock.address))
   */
  address public answerAddress;

  constructor(
    address _answerAddress
  ) public
  {
    require(_answerAddress != address(0), 'INVALID_ANSWER');
    answerAddress = _answerAddress;
  }

  /**
   * @notice Returns the price per key.
   */
  function keyPurchasePrice(
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/
  ) external view
    returns (uint minKeyPrice)
  {
    return IPublicLockV7(msg.sender).keyPrice();
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
  ) external
  {
    // Confirm `_to` (the new keyOwner)
    bytes32 secretHash = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_recipient)));
    require(ECDSA.recover(secretHash, _data) == answerAddress, 'INCORRECT_CODE');
  }
}
