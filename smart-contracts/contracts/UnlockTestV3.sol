pragma solidity 0.4.24;

/**
 * @title Example upgrade of the Unlock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @author HardlyDifficult
 *
 * This is a copy paste of the current Unlock contract, with comments removed.
 * Then a few small changes have been made, higlighted with comments.
 */

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";
import "./PublicLock.sol";
import "./interfaces/IUnlock.sol";


contract UnlockTestV3 is Initializable, Ownable {

  struct LockBalances {
    bool deployed;
    uint totalSales;
    uint yieldedDiscountTokens;
  }

  modifier onlyFromDeployedLock() {
    require(locks[msg.sender].deployed, "Only from previously deployed locks");
    _;
  }

  uint public grossNetworkProduct;

  uint public totalDiscountGranted;

  mapping (address => LockBalances) public locks;

  event NewLock(
    address indexed lockOwner,
    address indexed newLockAddress
  );

  bool internal initialized;

  // Example new data (which must come after the original data)
  bool internal initializedV3;
  uint public exampleData;

  function initialize(
    address _owner
  )
    public
    initializer()
  {
    // We must manually initialize Ownable.sol
    Ownable.initialize(_owner);
    require(!initialized);
    exampleData = 42;
    initialized = true;
  }

  // Adding a second initialize for the new data as 'initialized' is already true when v3 is deployed.
  function initializeV3()
    public
  {
    require(!initializedV3);
    exampleData = 42;
    initializedV3 = true;
  }

  // Removed most existing methods
  // Example new method
  function testNewMethod()
    public
    view
    returns (uint sum)
  {
    return grossNetworkProduct + totalDiscountGranted + exampleData;
  }

  // Changing the method signature and removing modifier
  function recordConsumedDiscount(
    uint _discount
  )
    public
  {
    totalDiscountGranted += _discount;
    return;
  }

}
