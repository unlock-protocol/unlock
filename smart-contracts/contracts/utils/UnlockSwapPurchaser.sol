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

  /**
   * Set the address of Uniswap Permit2 helper contract
   * @param _unlockAddress the address of Unlock contract  
   * @param _permit2Address the address of Uniswap PERMIT2 contract  
   */
  constructor(address _unlockAddress, address _permit2Address) {
    unlockAddress = _unlockAddress;
    permit2 = _permit2Address;
  }


  /**
   * Simple helper to retrieve balance in ERC20 or native tokens
   * @param token the address of the token (address(0) for native token)
   */
  function getBalance(address token) internal view returns (uint) {
    return token == address(0) ?
      address(this).balance 
      :
      IMintableERC20(token).balanceOf(address(this));
  }

  /**
   * Swap tokens and call a function a lock contract.
   * 
   * Calling this function will 1) swap the token sent by the user into the token (ERCC20 or native) used by
   * the lock contract using Uniswap Universal Router and 2) call the lock contract with the specified calldata
   * 
   * @param lock the address of the lock
   * @param srcToken the address of the token sent by the user (ERC20 or address(0) for native)
   * @param amountInMax the maximum amount the user want to spend in the swap
   * @param uniswapRouter the address of the uniswap router
   * @param swapCalldata the Uniswap quote calldata returned by the SDK, to be sent to the router contract
   * @param callData the encoded instructions to be executed by the lock
   *
   * @return the bytes as returned by the execution on the lock
   * 
   * @notice If the actual amount spent is less than the specified maximum amount, the remaining tokens will 
   * be held by the Unlock contract
   */
  function swapAndCall(
    address lock,
    address srcToken,
    uint amountInMax,
    address uniswapRouter, 
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
    ) < balanceTokenDestBefore + IPublicLock(lock).keyPrice()) {
      revert InsufficientBalance();
    }

    // approve ERC20 to call the lock
    if(destToken != address(0)) {
      IMintableERC20(destToken).approve(lock, IPublicLock(lock).keyPrice());
    }

    // call the lock
    (bool lockCallSuccess, bytes memory returnData) = lock.call{
      value: destToken == address(0) ? IPublicLock(lock).keyPrice() : 0
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

  // required to withdraw WETH
  receive() external payable {}
}
