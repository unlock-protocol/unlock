pragma solidity 0.4.25;


contract MixinNoFallback
{
  /**
   * @dev the fallback function should not be used.  This explicitly reverts
   * to ensure it's never used.
   */
  function()
    external
  {
    revert('NO_FALLBACK');
  }
}