pragma solidity 0.5.13;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/Unlock.sol";

contract TestUnlock {
  Unlock unlock = Unlock(DeployedAddresses.Unlock());
}
