//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";

error WRONG_PASSWORD();
error NOT_AUTHORIZED();

contract PasswordRequiredHook {
  mapping(address => address) public signers;

  /** NO OP */
  constructor() {}

  /**
   * Function to set the signer for a lock.
   */
  function setSigner(address lock, address signer) public {
    if (!IPublicLockV12(lock).isLockManager(msg.sender)) {
      revert NOT_AUTHORIZED();
    }
    signers[lock] = signer;
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
    if (getSigner(toString(recipient), signature) == signers[msg.sender]) {
      return IPublicLockV12(msg.sender).keyPrice();
    }
    revert WRONG_PASSWORD();
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

  /**
   * No-op but required for the hook to work
   */
  function onKeyPurchase(
    uint256 /* tokenId */,
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/,
    uint256 /*minKeyPrice*/,
    uint256 /*pricePaid*/
  ) external {}
}
