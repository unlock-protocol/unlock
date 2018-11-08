pragma solidity 0.4.24;

/**
 * @title Example upgrade of the Unlock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * @author HardlyDifficult
 *
 * This inherits from the previous version, adds data and modifies logic.
 */

import "./Unlock.sol";


contract UnlockTestV2 is Unlock {

  // Example new data (which must come after the original data)
  bool internal initializedV2;
  uint public exampleData;

  // Adding a second initialize for the new data as 'initialized' is already true when v2 is deployed.
  function initializeV2()
    public
  {
    require(!initializedV2);
    exampleData = 42;
    initializedV2 = true;
  }

  function computeAvailableDiscountFor(
    address _purchaser, // solhint-disable-line no-unused-vars
    uint _keyPrice // solhint-disable-line no-unused-vars
  )
    public
    view
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

}
