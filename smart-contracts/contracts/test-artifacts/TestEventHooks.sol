pragma solidity 0.8.21;

import "../interfaces/hooks/ILockKeyPurchaseHook.sol";
import "../interfaces/hooks/ILockKeyCancelHook.sol";
import "../interfaces/hooks/ILockTokenURIHook.sol";
import "../interfaces/IPublicLock.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Test contract for lock event hooks.
 */
contract TestEventHooks is
  ILockKeyPurchaseHook,
  ILockKeyCancelHook,
  ILockTokenURIHook
{
  using Strings for uint;
  using Strings for address;

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

  event OnHasRole(bytes32 role, address account);

  uint public discount;
  bool public isPurchaseSupported;
  address public roleERC20;

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

  // hasRole logic
  function setupERC20Role(address _erc20Contract) external {
    roleERC20 = _erc20Contract;
  }

  bytes32 internal constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER");
  bytes32 internal constant KEY_GRANTER_ROLE = keccak256("KEY_GRANTER");

  // requires at least 10 to be lock manager, and at least 20 to be key granter
  function hasRole(
    bytes32 role,
    address account,
    bool nativeRole
  ) external view returns (bool) {
    // emit OnHasRole(role, account);
    if (roleERC20 != address(0)) {
      uint balance = IERC20(roleERC20).balanceOf(account);
      if (role == LOCK_MANAGER_ROLE) {
        return balance > 10e18;
      } else if (role == KEY_GRANTER_ROLE) {
        return balance > 20e18;
      }
      return false;
    } else {
      return nativeRole;
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
    string memory lockAddress = _lockAddress.toHexString();
    string memory operator = _operator.toHexString();
    string memory owner = _owner.toHexString();
    string memory expirationTimestamp = _expirationTimestamp.toString();

    if (_tokenId != 0) {
      tokenId = _tokenId.toString();
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
