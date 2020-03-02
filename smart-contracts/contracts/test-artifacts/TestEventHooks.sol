pragma solidity 0.5.16;

import '../interfaces/ILockEventHooks.sol';

/**
 * @title Test contract for lock event hooks.
 * @author Nick Mancuso (unlock-protocol.com)
 */
contract TestEventHooks is ILockEventHooks
{
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