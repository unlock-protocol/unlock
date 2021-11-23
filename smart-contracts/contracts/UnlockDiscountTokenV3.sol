// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './UnlockDiscountTokenV2.sol';

/**
* @title The Unlock Discount Token
* This smart contract implements the Unlock Discount Token
*/
contract UnlockDiscountTokenV3 is UnlockDiscountTokenV2 {

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    /**
      * This two lines were added on Nov 21st 2021 after an attack on UDT deployer wallet
      * They prevent token transfers from Polygon and xDai bridges
      */
    require(from != 0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf, "Transfer from Polygon disabled");
    require(from != 0x88ad09518695c6c3712AC10a214bE5109a655671, "Transfer from xDAI disabled");

    return super._beforeTokenTransfer(from, to, amount);
  }
}