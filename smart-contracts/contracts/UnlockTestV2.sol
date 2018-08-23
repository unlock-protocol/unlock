pragma solidity 0.4.24;

/**
 * @title Example upgrade of the Unlock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @author HardlyDifficult
 * 
 * This is a copy paste of the current Unlock contract, with comments removed.
 * Then a few small changes have been made, higlighted with comments.
 */

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Lock.sol";


contract UnlockTestV2 is Ownable {

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
  bool internal initializedV2;
  uint public exampleData;

  function initialize(
    address _owner
  )
    public 
  {
    require(!initialized);
    owner = _owner;
    grossNetworkProduct = 0;
    totalDiscountGranted = 0;
    exampleData = 42;
    initialized = true;
  }

  // Adding a second initialize for the new data as 'initialized' is already true when v2 is deployed.
  function initializeV2()
    public 
  {
    require(!initializedV2);
    exampleData = 42;
    initializedV2 = true;
  }

  function createLock(
    Lock.KeyReleaseMechanisms _keyReleaseMechanism,
    uint _expirationDuration,
    uint _keyPrice,
    uint _maxNumberOfKeys
  )
    public
    returns (Lock lock)
  {

    Lock newLock = new Lock(
      msg.sender,
      _keyReleaseMechanism,
      _expirationDuration,
      _keyPrice,
      _maxNumberOfKeys
    );

    locks[address(newLock)] = LockBalances({
      deployed: true,
      totalSales: 0,
      yieldedDiscountTokens: 0
    });

    emit NewLock(msg.sender, address(newLock));

    return newLock;
  }

  function computeAvailableDiscountFor(
    address _purchaser,
    uint _keyPrice
  )
    public
    pure
    returns (uint discount, uint tokens)
  {
    // an example modification
    return (42, 42);
  }

  // an example new method
  function testNewMethod()
    public
    view
    returns (uint sum)
  {
    return grossNetworkProduct + totalDiscountGranted + exampleData;
  }

  function recordKeyPurchase(
    uint _value,
    address _referrer
  )
    public
    onlyFromDeployedLock()
  {
    grossNetworkProduct += _value;
    return;
  }

  function recordConsumedDiscount(
    uint _discount,
    uint _tokens 
  )
    public
    onlyFromDeployedLock()
  {
    totalDiscountGranted += _discount;
    return;
  }

}
