// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import "../interfaces/IMintableERC20.sol";
import "../interfaces/IPermit2.sol";
import "../interfaces/IPublicLock.sol";
import "../interfaces/IUnlock.sol";

contract UnlockSwapPurchaser {

  // Unlock address on current chain
  address public unlockAddress;
  
  // The  Uniswap Universal Router
  address public uniswapRouter;

  // required by Uniswap Universal Router
  address public permit2;

  // events
  event SwapCall(
    address lock,
    address tokenAddress,
    uint amountSpent
  );

  // errors
  error SwapFailed(address uniswapRouter, address tokenIn, address tokenOut, uint amountInMax, bytes callData);
  error LockDoesntExist(address lockAddress);
  error InsufficientBalance();
  error UnauthorizedBalanceChange();
  error LockCallFailed();


  constructor(address _unlockAddress, address _uniswapRouter, address _permit2) {
    unlockAddress = _unlockAddress;
    uniswapRouter = _uniswapRouter;
    permit2 = _permit2;
  }


  function getBalance(address token) internal view returns (uint) {
    return token == address(0) ?
      address(this).balance 
      :
      IMintableERC20(token).balanceOf(address(this));
  }

  /**
   * Please refer to IUnlock.sol for documentation
   */
  function swapAndCall(
    address lock,
    address srcToken,
    uint amountInMax,
    bytes memory swapCalldata,
    bytes memory callData
  ) public payable returns(bytes memory) {
    // check if lock exists
    (bool lockExists,,) = IUnlock(unlockAddress).locks(lock);
    if(!lockExists) {
      revert LockDoesntExist(lock);
    }

    // get lock pricing 
    address destToken = IPublicLock(lock).tokenAddress();

    // get price in destToken from lock
    uint keyPrice = IPublicLock(lock).keyPrice();

    // get balances of Unlock before
    // if payments in ETH, substract the value sent by user to get actual balance
    uint balanceTokenDestBefore = destToken == address(0) ? 
      getBalance(destToken) - msg.value 
            :
      getBalance(destToken);

    uint balanceTokenSrcBefore = 
        srcToken == address(0) ? 
          getBalance(srcToken) - msg.value 
          :
          getBalance(srcToken);

    if(srcToken != address(0)) {
      // Transfer the specified amount of src ERC20 to this contract
      TransferHelper.safeTransferFrom(srcToken, msg.sender, address(this), amountInMax);

      // Approve the router to spend src ERC20
      TransferHelper.safeApprove(srcToken, uniswapRouter, amountInMax);

      // approve PERMIT2 to manipulate the token
      IERC20(srcToken).approve(permit2, amountInMax);
    }

    // issue PERMIT2 Allowance
    IPermit2(permit2).approve(
      srcToken,
      uniswapRouter,
      uint160(amountInMax),
      uint48(block.timestamp + 60) // expires after 1min
    );

    // executes the swap
    (bool success, ) = uniswapRouter.call{ 
      value: srcToken == address(0) ? msg.value : 0 
    }(swapCalldata);

    // make sure to catch Uniswap revert
    if(success == false) {
      revert SwapFailed(uniswapRouter, srcToken, destToken, amountInMax, swapCalldata);
    }

    // make sure balance is enough to buy key
    if((
      destToken == address(0) ? 
      getBalance(destToken) - msg.value 
            :
      getBalance(destToken)
    ) < balanceTokenDestBefore + keyPrice) {
      revert InsufficientBalance();
    }

    // approve ERC20 to call the lock
    if(destToken != address(0)) {
      IMintableERC20(destToken).approve(lock, keyPrice);
    }

    // call the lock
    (bool lockCallSuccess, bytes memory returnData) = lock.call{
      value: destToken == address(0) ? keyPrice : 0
    }(
      callData
    );

    if(lockCallSuccess == false) {
      revert LockCallFailed();
    }

    // check that Unlock didnt spent more than it received
    if(
      getBalance(srcToken) - balanceTokenSrcBefore < 0
      ||
      getBalance(destToken) - balanceTokenDestBefore < 0
    ) {
      // balance too low
      revert UnauthorizedBalanceChange();
    }

    // returns whatever the lock returned
    return returnData;
  }
}
