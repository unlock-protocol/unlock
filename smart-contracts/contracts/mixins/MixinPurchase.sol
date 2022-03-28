// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './MixinDisable.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import './MixinFunds.sol';

/**
 * @title Mixin for the purchase-related functions.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinPurchase is
  MixinFunds,
  MixinDisable,
  MixinLockCore,
  MixinKeys
{
  event RenewKeyPurchase(address indexed owner, uint newExpiration);

  event GasRefunded(address indexed receiver, uint refundedAmount, address tokenAddress);
  
  event UnlockCallFailed(address indexed lockAddress, address unlockAddress);

  // default to 0 
  uint256 private _gasRefundValue;

  /**
  * @dev Set the value/price to be refunded to the sender on purchase
  */

  function setGasRefundValue(uint256 _refundValue) external {
    _onlyLockManager();
    _gasRefundValue = _refundValue;
  }
  
  /**
  * @dev Returns value/price to be refunded to the sender on purchase
  */
  function gasRefundValue() external view returns (uint256 _refundValue) {
    return _gasRefundValue;
  }

  /**
  * @dev Purchase function
  * @param _values array of tokens amount to pay for this purchase >= the current keyPrice - any applicable discount
  * (_values is ignored when using ETH)
  * @param _recipients array of addresses of the recipients of the purchased key
  * @param _referrers array of addresses of the users making the referral
  * @param _keyManagers optional array of addresses to grant managing rights to a specific address on creation
  * @param _data arbitrary data populated by the front-end which initiated the sale
  * @notice when called for an existing and non-expired key, the `_keyManager` param will be ignored 
  * @dev Setting _value to keyPrice exactly doubles as a security feature. That way if the lock owner increases the
  * price while my transaction is pending I can't be charged more than I expected (only applicable to ERC-20 when more
  * than keyPrice is approved for spending).
  */
  function purchase(
    uint256[] memory _values,
    address[] memory _recipients,
    address[] memory _referrers,
    address[] memory _keyManagers,
    bytes calldata _data
  ) external payable
  {
    _onlyIfAlive();
    _lockIsUpToDate();
    require(maxNumberOfKeys > _totalSupply, 'LOCK_SOLD_OUT');
    require(_recipients.length == _referrers.length, 'INVALID_REFERRERS_LENGTH');
    require(_recipients.length == _keyManagers.length, 'INVALID_KEY_MANAGERS_LENGTH');

    uint totalPriceToPay;

    for (uint256 i = 0; i < _recipients.length; i++) {
      // check recipient address
      address _recipient = _recipients[i];
      require(_recipient != address(0), 'INVALID_ADDRESS');
      
      // check for a non-expiring key
      if (expirationDuration == type(uint).max) {
        // create a new key
        _createNewKey(
          _recipient,
          _keyManagers[i],
          type(uint).max
        );
      } else {
        _createNewKey(
          _recipient,
          _keyManagers[i],
          block.timestamp + expirationDuration
        );
      }

      // price      
      uint inMemoryKeyPrice = _purchasePriceFor(_recipient, _referrers[i], _data);
      totalPriceToPay = totalPriceToPay + inMemoryKeyPrice;

      if(tokenAddress != address(0)) {
        require(inMemoryKeyPrice <= _values[i], 'INSUFFICIENT_ERC20_VALUE');
      }

      // make sure unlock is a contract, and we catch possible reverts
      if (address(unlockProtocol).code.length > 0) {
        // call Unlock contract to record GNP
        // the function is capped by gas to prevent running out of gas
        try unlockProtocol.recordKeyPurchase{gas: 300000}(inMemoryKeyPrice, _referrers[i]) 
        {} 
        catch {
          // emit missing unlock
          emit UnlockCallFailed(address(this), address(unlockProtocol));
        }
      } else {
        // emit missing unlock
        emit UnlockCallFailed(address(this), address(unlockProtocol));
      }

      // fire hook
      uint pricePaid = tokenAddress == address(0) ? msg.value : _values[i];
      if(address(onKeyPurchaseHook) != address(0)) {
        onKeyPurchaseHook.onKeyPurchase(
          msg.sender, 
          _recipient, 
          _referrers[i], 
          _data, 
          inMemoryKeyPrice, 
          pricePaid
        );
      }
    }

    // transfer the ERC20 tokens
    if(tokenAddress != address(0)) {
      IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
      token.transferFrom(msg.sender, address(this), totalPriceToPay);
    } else {
      // We explicitly allow for greater amounts of ETH or tokens to allow 'donations'
      require(totalPriceToPay <= msg.value, 'INSUFFICIENT_VALUE');
    }

    // refund gas
    if (_gasRefundValue != 0) {
      if(tokenAddress != address(0)) {
        IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
        token.transferFrom(address(this), msg.sender, _gasRefundValue);
      } else {
        (bool success, ) = msg.sender.call{value: _gasRefundValue}("");
        require(success, "REFUND_FAILED");
      }
      emit GasRefunded(msg.sender, _gasRefundValue, tokenAddress);
    }
  }

  /**
  * @dev Extend function
  * @param _value the number of tokens to pay for this purchase >= the current keyPrice - any applicable discount
  * (_value is ignored when using ETH)
  * @param _tokenId id of the key to extend
  * @param _referrer address of the user making the referral
  * @param _data arbitrary data populated by the front-end which initiated the sale
  * @dev Throws if lock is disabled or key does not exist for _recipient. Throws if _recipient == address(0).
  */
  function extend(
    uint _value,
    uint _tokenId,
    address _referrer,
    bytes calldata _data
  ) 
    public 
    payable
  {
    _onlyIfAlive();
    _lockIsUpToDate();
    _isKey(_tokenId);

    // extend key duration
    _extendKey(_tokenId);

    // transfer the tokens
    uint inMemoryKeyPrice = _purchasePriceFor(ownerOf(_tokenId), _referrer, _data);

    if(tokenAddress != address(0)) {
      require(inMemoryKeyPrice <= _value, 'INSUFFICIENT_ERC20_VALUE');
      IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
      token.transferFrom(msg.sender, address(this), inMemoryKeyPrice);
    } else {
      // We explicitly allow for greater amounts of ETH or tokens to allow 'donations'
      require(inMemoryKeyPrice <= msg.value, 'INSUFFICIENT_VALUE');
    }
  }

  /**
   * @notice returns the minimum price paid for a purchase with these params.
   * @dev minKeyPrice considers any discount from Unlock or the OnKeyPurchase hook
   */
  function purchasePriceFor(
    address _recipient,
    address _referrer,
    bytes calldata _data
  ) external view
    returns (uint minKeyPrice)
  {
    minKeyPrice = _purchasePriceFor(_recipient, _referrer, _data);
  }

  /**
   * @notice returns the minimum price paid for a purchase with these params.
   * @dev minKeyPrice considers any discount from Unlock or the OnKeyPurchase hook
   */
  function _purchasePriceFor(
    address _recipient,
    address _referrer,
    bytes memory _data
  ) internal view
    returns (uint minKeyPrice)
  {
    if(address(onKeyPurchaseHook) != address(0))
    {
      minKeyPrice = onKeyPurchaseHook.keyPurchasePrice(msg.sender, _recipient, _referrer, _data);
    }
    else
    {
      minKeyPrice = keyPrice;
    }
    return minKeyPrice;
  }

  uint256[1000] private __safe_upgrade_gap;
}
