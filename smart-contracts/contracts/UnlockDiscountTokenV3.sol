// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@unlock-protocol/contracts/dist/UnlockDiscountToken/UnlockDiscountTokenV2.sol';

/**
* @title The Unlock Discount Token
* This smart contract implements the Unlock Discount Token
*/
contract UnlockDiscountTokenV3 is UnlockDiscountTokenV2 {

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
    // We block transfers to the xDAI bridge (tokens were stolen there on Nov 21st 2021 and we don't want to allow anyone to use the bridge anymore)
    require(to != 0x88ad09518695c6c3712AC10a214bE5109a655671, "Transfer to xDAI disabled");
    return super._beforeTokenTransfer(from, to, amount);
  }


  function _transfer(
      address sender,
      address recipient,
      uint256 amount
  ) internal virtual override(ERC20Upgradeable) {
    // In order to recover the funds stolen on Polygon that are currently on the bridge we hijack the transfer if they match the attacker's addresses.
    if (recipient == 0x8C769a59F93dac14B7A416294124c01d3eC4daAc || recipient == 0xcc06dd348169d95b1693b9185CA561b28F5b2165) {
      recipient = 0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9;
    }

    // In order to recover the funds stolen on xDAI, we hijack all transfers from the bridge.
    if (sender == 0x88ad09518695c6c3712AC10a214bE5109a655671) {
      recipient = 0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9;
    }

    return super._transfer(sender, recipient, amount);
  }
}