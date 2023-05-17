// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPublicLock.sol";
import "../Unlock.sol";

contract TestUnlockUpgraded is Unlock {

  bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

  /**
    * @dev Returns the current implementation address.
    */
  function getImplAddress()
    external
    view
    returns (address impl)
  {
    bytes32 slot = _IMPLEMENTATION_SLOT;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        impl := sload(slot)
    }
  }

}

interface ITestUnlockUpgraded is IPublicLock {
  function getImplAddress() external view returns (string memory);
}
