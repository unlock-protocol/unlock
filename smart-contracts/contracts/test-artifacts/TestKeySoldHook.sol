pragma solidity 0.5.10;

import '../interfaces/IUnlockEventHooks.sol';
import '@openzeppelin/contracts/introspection/IERC1820Registry.sol';


/**
 * @title Test contract for the keySold hook.
 * @author Nick Mancuso (unlock-protocol.com)
 */
contract TestKeySoldHook
{
  IERC1820Registry public erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

  // `keccak256("IUnlockEventHooks_keySold")`
  bytes32 public constant keySoldInterfaceId = 0x4d99da10ff5120f726d35edd8dbd417bbe55d90453b8432acd284e650ee2c6f0;

  // `keccak256("IUnlockEventHooks_keyCancel")`
  bytes32 public constant keyCancelInterfaceId = 0xd6342b4bfdf66164985c9f5fe235f643a035ee12f507d7bd0f8c89e07e790f68;

  event OnKeySold(
    address lock,
    address from,
    address to,
    address referrer,
    uint pricePaid,
    bytes data
  );
  event OnKeyCancel(
    address lock,
    address operator,
    address to,
    uint refund
  );

  constructor() public
  {
    erc1820.setInterfaceImplementer(address(this), keySoldInterfaceId, address(this));
    erc1820.setInterfaceImplementer(address(this), keyCancelInterfaceId, address(this));
  }

  function keySold(
    address from,
    address to,
    address referrer,
    uint pricePaid,
    bytes calldata data
  ) external
  {
    emit OnKeySold(msg.sender, from, to, referrer, pricePaid, data);
  }

  function keyCancel(
    address operator,
    address to,
    uint refund
  ) external
  {
    emit OnKeyCancel(msg.sender, operator, to, refund);
  }
}