pragma solidity 0.5.17;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol';


/**
 * @title An implementation of the money related functions.
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFunds
{
  using Address for address payable;
  using SafeERC20 for IERC20;

  /**
   * The token-type that this Lock is priced in.  If 0, then use ETH, else this is
   * a ERC20 token address.
   */
  address public tokenAddress;

  function _initializeMixinFunds(
    address _tokenAddress
  ) internal
  {
    tokenAddress = _tokenAddress;
    require(
      _tokenAddress == address(0) || IERC20(_tokenAddress).totalSupply() > 0,
      'INVALID_TOKEN'
    );
  }

  /**
   * Transfers funds from the contract to the account provided.
   *
   * Security: be wary of re-entrancy when calling this function.
   */
  function _transfer(
    address _tokenAddress,
    address _to,
    uint _amount
  ) internal
  {
    if(_amount > 0) {
      if(_tokenAddress == address(0)) {
        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        address(uint160(_to)).sendValue(_amount);
      } else {
        IERC20 token = IERC20(_tokenAddress);
        token.safeTransfer(_to, _amount);
      }
    }
  }
}