pragma solidity ^0.4.18;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Unlock.sol";

contract TestUnlock {
  Unlock unlock = Unlock(DeployedAddresses.Unlock());

  // function testCreateLock() public {
  //   Lock lock = unlock.createLock(0x7075626c6963, Lock.KeyReleaseMechanisms.Public, 60 * 60 * 24 * 30, 0, 0x0, 10000000, 100);
  //   Assert.equal(address(lock.unlockProtocol), DeployedAddresses.Unlock(), "The UnlockProtocol address should be the creator's");
  // }


}
