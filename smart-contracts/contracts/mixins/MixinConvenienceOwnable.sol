// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinLockCore.sol';
import './MixinErrors.sol';

/**
 * @title Mixin to add support for `ownable()`
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinConvenienceOwnable is MixinErrors, MixinLockCore {

  // used for `owner()`convenience helper
  address private _convenienceOwner;

  // events
  event OwnershipTransferred(address previousOwner, address newOwner);

  function _initializeMixinConvenienceOwnable(address _sender) internal {
    _convenienceOwner = _sender;
  }

  /** `owner()` is provided as an helper to mimick the `Ownable` contract ABI.
    * The `Ownable` logic is used by many 3rd party services to determine
    * contract ownership - e.g. who is allowed to edit metadata on Opensea.
    * 
    * @notice This logic is NOT used internally by the Unlock Protocol and is made 
    * available only as a convenience helper.
   */
  function owner() public view returns (address) {
    return _convenienceOwner;
  }

  /** Setter for the `owner` convenience helper (see `owner()` docstring for more).
    * @notice This logic is NOT used internally by the Unlock Protocol ans is made 
    * available only as a convenience helper.
    * @param account address returned by the `owner()` helper
   */ 
  function setOwner(address account) public {
    _onlyLockManager();
    require(account != address(0), errors.OWNER_CANT_BE_ADDRESS_ZERO);
    address _previousOwner = _convenienceOwner;
    _convenienceOwner = account;
    emit OwnershipTransferred(_previousOwner, account);
  }

  function isOwner(address account) public view returns (bool) {
    return _convenienceOwner == account;
  }

  uint256[1000] private __safe_upgrade_gap;

}