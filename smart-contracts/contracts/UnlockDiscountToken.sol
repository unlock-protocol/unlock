pragma solidity 0.5.12;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Mintable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Detailed.sol';


/**
* @title The Unlock Discount Token
* This smart contract implements the Unlock Discount Token
*/
contract UnlockDiscountToken is
ERC20Mintable,
ERC20Detailed
{
  function initialize() public initializer {
    ERC20Mintable.initialize(msg.sender);
    ERC20Detailed.initialize('Unlock Discount Token', 'UDT', 18);
  }
}
