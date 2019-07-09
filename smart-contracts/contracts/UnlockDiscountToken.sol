pragma solidity 0.5.9;

import 'openzeppelin-eth/contracts/token/ERC20/ERC20Mintable.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol';


/**
 * This is an implementation of an ERC20 token to be used in tests.
 * It's a standard ERC20 implementation + `mint` (for testing).
 *
 * This contract should not be used in production.
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
