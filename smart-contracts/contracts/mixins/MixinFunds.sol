pragma solidity 0.5.14;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';


/**
 * @title An implementation of the money related functions.
 * @author HardlyDifficult (unlock-protocol.com)
 */
contract MixinFunds is Ownable
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
   * Gets the current balance of the account provided.
   */
  function getBalance(
    address _tokenAddress,
    address _account
  ) public view
    returns (uint)
  {
    if(_tokenAddress == address(0)) {
      return _account.balance;
    } else {
      return IERC20(_tokenAddress).balanceOf(_account);
    }
  }

  /**
   * Ensures that the msg.sender has paid at least the price stated.
   *
   * With ETH, this means the function originally called was `payable` and the
   * transaction included at least the amount requested.
   *
   * Security: be wary of re-entrancy when calling this function.
   */
  function _chargeAtLeast(
    uint _price
  ) internal returns (uint)
  {
    if(_price > 0) {
      if(tokenAddress == address(0)) {
        require(msg.value >= _price, 'NOT_ENOUGH_FUNDS');
        return msg.value;
      } else {
        IERC20 token = IERC20(tokenAddress);
        token.safeTransferFrom(msg.sender, address(this), _price);
        return _price;
      }
    }
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