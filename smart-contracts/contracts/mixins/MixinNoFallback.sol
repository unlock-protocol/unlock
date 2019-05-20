pragma solidity 0.5.8;


/**
 * @title Mixin for the fallback function implementation, which simply reverts.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
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