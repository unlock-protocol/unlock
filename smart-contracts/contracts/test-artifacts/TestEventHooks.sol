pragma solidity 0.5.17;

import '../interfaces/hooks/ILockKeyPurchaseHook.sol';
import '../interfaces/hooks/ILockKeyCancelHook.sol';
import '../interfaces/hooks/ILockTokenURIHook.sol';
import '../interfaces/IPublicLock.sol';
import '../UnlockUtils.sol';


/**
 * @title Test contract for lock event hooks.
 * @author Nick Mancuso (unlock-protocol.com)
 */
contract TestEventHooks is ILockKeyPurchaseHook, ILockKeyCancelHook, ILockTokenURIHook
{

  using UnlockUtils for uint;
  using UnlockUtils for address;

  event OnKeyPurchase(
    address lock,
    address from,
    address recipient,
    address referrer,
    uint minKeyPrice,
    uint pricePaid
  );

  event OnKeyCancel(
    address lock,
    address operator,
    address to,
    uint refund
  );
  
  event OnKeyTransfer(
    address lock,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint time
  );

  uint public discount;
  bool public isPurchaseSupported;

  function configure(
    bool _isPurchaseSupported,
    uint _discount
  ) public
  {
    isPurchaseSupported = _isPurchaseSupported;
    discount = _discount;
  }

  function onKeyPurchase(
    address _from,
    address _recipient,
    address _referrer,
    bytes calldata /*_data*/,
    uint _minKeyPrice,
    uint _pricePaid
  ) external
  {
    emit OnKeyPurchase(msg.sender, _from, _recipient, _referrer, _minKeyPrice, _pricePaid);
  }

  function keyPurchasePrice(
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/
  ) external view
    returns (uint minKeyPrice)
  {
    require(isPurchaseSupported, 'PURCHASE_BLOCKED_BY_HOOK');
    minKeyPrice = IPublicLock(msg.sender).keyPrice();
    if(discount < minKeyPrice)
    {
      minKeyPrice -= discount;
    }
    else
    {
      minKeyPrice = 0;
    }
  }

  function onKeyCancel(
    address _operator,
    address _to,
    uint _refund
  ) external
  {
    emit OnKeyCancel(msg.sender, _operator, _to, _refund);
  }
  
  function onKeyTransfer(
    address _lockAddress,
    uint _tokenId,
    address _operator,
    address _from,
    address _to,
    uint _expirationTimestamp
  ) external
  {
    emit OnKeyTransfer(
      _lockAddress, // lock address
      _tokenId,
      _operator,
      _from, 
      _to, 
      _expirationTimestamp
    );
  }

  // test case for valid key hook
  mapping (address => address) specialMembers;
  
  function setSpecialMember(
    address _lockAddress, 
    address _specialMember
  ) public {
    specialMembers[_lockAddress] = _specialMember;
  }

  function hasValidKey(
    address _lockAddress,
    address _from,
    uint, // removed var name to silence "unused" warning
    bool _hasValidKey
  ) external view
    returns (bool isValidKey)
  { 
    // special members should always have access to content, even when the key is expired or they don't have one
    if(!_hasValidKey && (specialMembers[_lockAddress] == _from)) {
      isValidKey = true;
    } else {
      isValidKey = _hasValidKey;
    }
  }

  string public baseURI = 'https://unlock-uri-hook.test/';

  function tokenURI(
    address _lockAddress,
    address _operator,
    address _owner,
    uint256 _tokenId,
    uint _expirationTimestamp
  ) external view returns(string memory) {

    string memory tokenId;
    string memory lockAddress = _lockAddress.address2Str();
    string memory operator = _operator.address2Str();
    string memory owner = _owner.address2Str();
    string memory expirationTimestamp = _expirationTimestamp.uint2Str();

    if(_tokenId != 0) {
      tokenId = _tokenId.uint2Str();
    } else {
      tokenId = '';
    }

    return string(
      abi.encodePacked(
        baseURI,
        abi.encodePacked(
          lockAddress,
          '/',
          owner,
          '/',
          operator
        ),
        '/',
        expirationTimestamp,
        '/',
        tokenId
      )
    );
  }
}