// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

error TOO_BIG();
error NOT_AUTHORIZED();

contract DiscountHook {
  // mapping of lock address, to address for password to keyPrice
  mapping(address => mapping(address => uint)) public discounts;
  // mapping of lock address, to address to cap
  mapping(address => mapping(address => uint256)) public caps;
  // mapping of lock address, to address to counter
  mapping(address => mapping(address => uint256)) public counters;

  constructor() {}

  // discount is expressed in basis points (ie 100% is 10000)
  function setSigner(
    address lock,
    address signer,
    uint discount,
    uint cap
  ) public {
    if (discount > 10000) {
      revert TOO_BIG();
    }
    if (!IPublicLockV12(lock).isLockManager(msg.sender)) {
      revert NOT_AUTHORIZED();
    }
    discounts[lock][signer] = discount;
    caps[lock][signer] = cap;
  }

  /**
   * Price is the same for everyone...
   * but we fail if signer of data does not match the lock's password.
   */
  function keyPurchasePrice(
    address /* from */,
    address recipient,
    address /* referrer */,
    bytes calldata signature /* data */
  ) external view returns (uint256 minKeyPrice) {
    uint keyPrice = IPublicLockV12(msg.sender).keyPrice();
    if (signature.length == 0) {
      return keyPrice;
    }
    address signer = getSigner(toString(recipient), signature);
    if (
      discounts[msg.sender][signer] > 0 && // If there is a discount
      caps[msg.sender][signer] > 0 && // If the cap is not reached
      counters[msg.sender][signer] < caps[msg.sender][signer] // if the counter is not reached
    ) {
      // Overflow?
      return keyPrice - (keyPrice * discounts[msg.sender][signer]) / 10000;
    }
    return keyPrice;
  }

  /**
   * No-op but required for the hook to work
   */
  function onKeyPurchase(
    uint256 /* tokenId */,
    address /*from*/,
    address recipient,
    address /*referrer*/,
    bytes calldata signature,
    uint256 /*minKeyPrice*/,
    uint256 /*pricePaid*/
  ) external {
    if (signature.length == 0) {
      return;
    }
    address signer = getSigner(toString(recipient), signature);
    counters[msg.sender][signer] += 1;
  }

  /**
   * Debug function
   */
  function getSigner(
    string memory message,
    bytes calldata signature
  ) public pure returns (address recoveredAddress) {
    bytes32 hash = keccak256(abi.encodePacked(message));
    bytes32 signedMessageHash = MessageHashUtils.toEthSignedMessageHash(hash);
    return ECDSA.recover(signedMessageHash, signature);
  }

  /**
   * Helper functions to turn address into string so we can verify
   * the signature (address is signed as string on the client)
   */
  function toString(address account) public pure returns (string memory) {
    return toString(abi.encodePacked(account));
  }

  function toString(uint256 value) public pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes32 value) public pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes memory data) public pure returns (string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint256 i = 0; i < data.length; i++) {
      str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
      str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
    }
    return string(str);
  }
}
