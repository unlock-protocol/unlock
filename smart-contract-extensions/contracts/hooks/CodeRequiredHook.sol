pragma solidity 0.5.17;

import '@openzeppelin/contracts/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/access/roles/WhitelistAdminRole.sol';
import '@openzeppelin/contracts/introspection/IERC1820Registry.sol';
import 'hardlydifficult-ethereum-contracts/contracts/proxies/CallContract.sol';

/**
 * @notice Used with a Lock in order to require the user knows
 * a code in order to buy.
 * @dev Set this contract as the beneficiary of the lock.
 */
contract CodeRequiredHook is WhitelistAdminRole
{
  using CallContract for address;

  IERC1820Registry public constant erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

  // `keccak256("IUnlockEventHooks_keySold")`
  bytes32 public constant keySoldInterfaceId = 0x4d99da10ff5120f726d35edd8dbd417bbe55d90453b8432acd284e650ee2c6f0;

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
    erc1820.setInterfaceImplementer(address(this), keySoldInterfaceId, address(this));
  }

  /**
   * @notice This is called by the Lock when a purchase is attempted.
   * When this fails so does the purchase itself.
   * @param _data contains the signature from the `answerAddress`.
   */
  function keySold(
    address /* _from */,
    address _to,
    address /* _referrer */,
    uint /* _pricePaid */,
    bytes calldata _data
  ) external view
  {
    // Confirm `_to` (the new keyOwner)
    bytes32 secretHash = ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_to)));
    require(ECDSA.recover(secretHash, _data) == answerAddress, 'INCORRECT_CODE');
  }

  /**
   * @notice This call allows the owner to make any call, such as calling updateBeneficiary on the lock
   * which would remove the code requirement.
   */
  function proxyCall(
    address _contract,
    bytes memory _callData
  ) public onlyWhitelistAdmin()
  {
    _contract._call(_callData, 0);
  }
}
