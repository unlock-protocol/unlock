// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GitcoinHook is Ownable {
  mapping(address => bool) public signers;

  constructor() {}

  function addSigner(address signer) public onlyOwner {
    signers[signer] = true;
  }

  function removeSigner(address signer) public onlyOwner {
    signers[signer] = false;
  }

  /**
   * Price is the same for everyone... but we fail if signature by Unlock Lab's backend service (sent as signature) does not match!
   * The Unlock Labs backend service verifies that the purchaser has a valid Gitcoin passport and signs the address of the recipient to confirm.
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
      return IPublicLockV13(msg.sender).keyPrice();
    }
  }

  /**
   * Debug function
   */
  function checkIsSigner(
    string memory message,
    bytes calldata signature /* data */
  ) private view returns (bool isSigner) {
    bytes memory encoded = abi.encodePacked(message);
    bytes32 messageHash = keccak256(encoded);
    bytes32 hash = ECDSA.toEthSignedMessageHash(messageHash);
    address recoveredAddress = ECDSA.recover(hash, signature);
    return signers[recoveredAddress];
  }

  /**
   * Helper functions to turn addresses into string so we can verify the signature
   */
  function toString(address account) private pure returns (string memory) {
    return toString(abi.encodePacked(account));
  }

  function toString(uint256 value) private pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes32 value) private pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes memory data) private pure returns (string memory) {
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
   * No-op but required
   */
  function onKeyPurchase(
    uint256 /* tokenId */,
    address /* from */,
    address /* recipient */,
    address /* referrer */,
    bytes calldata /* data */,
    uint256 /* minKeyPrice */,
    uint256 /* pricePai d*/
  ) external {
    /** no-op. this should have failed earlier if data is not the right signature  */
  }
}
