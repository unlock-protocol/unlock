pragma solidity 0.8.17;

import "../interfaces/hooks/ILockKeyPurchaseHook.sol";
import "../interfaces/hooks/ILockKeyCancelHook.sol";
import "../interfaces/hooks/ILockTokenURIHook.sol";
import "../interfaces/IPublicLock.sol";
import "../UnlockUtils.sol";

/**
 * @title Test contract for lock event hooks.
 */
contract TestEventHooks is
  ILockKeyPurchaseHook,
  ILockKeyCancelHook,
  ILockTokenURIHook
{
  using UnlockUtils for uint;
  using UnlockUtils for address;

  event OnKeyPurchase(
    uint tokenId,
    address lock,
    address from,
    address recipient,
    address referrer,
    uint minKeyPrice,
    uint pricePaid
  );

  event OnKeyCancel(address lock, address operator, address to, uint refund);

  event OnKeyExtend(
    uint tokenId,
    address msgSender,
    address from,
    uint newTimestamp,
    uint prevTimestamp
  );

  event OnKeyTransfer(
    address lock,
    uint tokenId,
    address operator,
    address from,
    address to,
    uint time
  );

  event OnKeyGranted(
    uint tokenId,
    address from,
    address to,
    address keyManager,
    uint expiration
  );

  uint public discount;
  bool public isPurchaseSupported;

  function configure(bool _isPurchaseSupported, uint _discount) public {
    isPurchaseSupported = _isPurchaseSupported;
    discount = _discount;
  }

  function onKeyPurchase(
    uint _tokenId,
    address _from,
    address _recipient,
    address _referrer,
    bytes calldata /*_data*/,
    uint _minKeyPrice,
    uint _pricePaid
  ) external {
    emit OnKeyPurchase(
      _tokenId,
      msg.sender,
      _from,
      _recipient,
      _referrer,
      _minKeyPrice,
      _pricePaid
    );
  }

  function onKeyGranted(
    uint _tokenId,
    address _from,
    address _recipient,
    address _keyManager,
    uint _expiration
  ) external {
    emit OnKeyGranted(_tokenId, _from, _recipient, _keyManager, _expiration);
  }

  function keyPurchasePrice(
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/
  ) external view returns (uint minKeyPrice) {
    require(isPurchaseSupported, "PURCHASE_BLOCKED_BY_HOOK");
    minKeyPrice = IPublicLock(msg.sender).keyPrice();
    if (discount < minKeyPrice) {
      minKeyPrice -= discount;
    } else {
      minKeyPrice = 0;
    }
  }

  function onKeyCancel(address _operator, address _to, uint _refund) external {
    emit OnKeyCancel(msg.sender, _operator, _to, _refund);
  }

  function onKeyExtend(
    uint _tokenId,
    address _from,
    uint _newTimestamp,
    uint _prevTimestamp
  ) external {
    emit OnKeyExtend(
      _tokenId,
      msg.sender,
      _from,
      _newTimestamp,
      _prevTimestamp
    );
  }

  function onKeyTransfer(
    address _lockAddress,
    uint _tokenId,
    address _operator,
    address _from,
    address _to,
    uint _expirationTimestamp
  ) external {
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
  mapping(address => address) specialMembers;

  function setSpecialMember(
    address _lockAddress,
    address _specialMember
  ) public {
    specialMembers[_lockAddress] = _specialMember;
  }

  function isValidKey(
    address _lockAddress,
    address, // operator
    uint, // tokenId
    uint, //
    address _from,
    bool _hasValidKey
  ) external view returns (bool isValidKey) {
    // special members should always have access to content, even when the key is expired or they don't have one
    if (!_hasValidKey && (specialMembers[_lockAddress] == _from)) {
      isValidKey = true;
    } else {
      isValidKey = _hasValidKey;
    }
  }

  string public baseURI = "https://unlock-uri-hook.test/";

  function tokenURI(
    address _lockAddress,
    address _operator,
    address _owner,
    uint256 _tokenId,
    uint _expirationTimestamp
  ) external view returns (string memory) {
    string memory tokenId;
    string memory lockAddress = _lockAddress.address2Str();
    string memory operator = _operator.address2Str();
    string memory owner = _owner.address2Str();
    string memory expirationTimestamp = _expirationTimestamp.uint2Str();

    if (_tokenId != 0) {
      tokenId = _tokenId.uint2Str();
    } else {
      tokenId = "";
    }

    return
      string(
        abi.encodePacked(
          baseURI,
          abi.encodePacked(lockAddress, "/", owner, "/", operator),
          "/",
          expirationTimestamp,
          "/",
          tokenId
        )
      );
  }
}
