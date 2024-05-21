//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV12.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaptchaHook is Ownable {
  mapping(address => bool) public signers;

  constructor() Ownable(msg.sender) {}

  function addSigner(address signer) public onlyOwner {
    signers[signer] = true;
  }

  function removeSigner(address signer) public onlyOwner {
    signers[signer] = false;
  }

  /**
   * Price is the same for everyone... but we fail if signature by Unlock Lab's backend service (sent as signature) does not match!
   */
  function keyPurchasePrice(
    address /* from */,
    address recipient,
    address /* referrer */,
    bytes calldata signature /* data */
  ) external view returns (uint256 minKeyPrice) {
    string memory message = toString(recipient);
    require(checkIsSigner(message, signature), "WRONG_SIGNATURE");
    if (address(msg.sender).code.length > 0) {
      return IPublicLockV12(msg.sender).keyPrice();
    }
    return 0;
  }

  /**
   * Debug function
   */
  function checkIsSigner(
    string memory message,
    bytes calldata signature /* data */
  ) public view returns (bool isSigner) {
    bytes memory encoded = abi.encodePacked(message);
    bytes32 messageHash = keccak256(encoded);
    bytes32 hash = MessageHashUtils.toEthSignedMessageHash(messageHash);
    address recoveredAddress = ECDSA.recover(hash, signature);
    return signers[recoveredAddress];
  }

  /**
   * Helper functions to turn addrerss into string so we can verify the signature (address is signed as string on the client)
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
