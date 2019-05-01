pragma solidity 0.5.7;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import '../interfaces/IERC721.sol';
import '../UnlockUtils.sol';


/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  IERC721,
  Ownable,
  UnlockUtils
{
  /// A descriptive name for a collection of NFTs in this contract
  string private lockName;

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   */
  function updateLockName(
    string calldata _lockName
  ) external
    onlyOwner
  {
    lockName = _lockName;
  }

  /**
    * @dev Gets the token name
    * @return string representing the token name
    */
  function name(
  ) external view
    returns (string memory)
  {
    return lockName;
  }
}
