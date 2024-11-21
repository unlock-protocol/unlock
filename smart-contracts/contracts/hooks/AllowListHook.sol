/* solhint-disable no-inline-assembly */

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../interfaces/IPublicLock.sol";

contract AllowListHook {
  event MerkleRootSet(address lockAddress, bytes32 root);

  mapping(address => bytes32) public roots;
  error NOT_AUTHORIZED();

  function setMerkleRootForLock(address lockAddress, bytes32 root) public {
    IPublicLock lock = IPublicLock(lockAddress);
    if (!lock.isLockManager(msg.sender)) {
      revert NOT_AUTHORIZED();
    }
    roots[lockAddress] = root;
    emit MerkleRootSet(lockAddress, root);
  }

  /**
   */
  function keyPurchasePrice(
    address /* from */,
    address recipient,
    address /* referrer */,
    bytes calldata proof /* data */
  ) external view returns (uint256 minKeyPrice) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(recipient, 1))));
    if (
      !MerkleProof.verify(bytesToBytes32Array(proof), roots[msg.sender], leaf)
    ) {
      revert NOT_AUTHORIZED();
    }
    return IPublicLock(msg.sender).keyPrice();
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

  // A function to convert bytes to bytes32 array
  function bytesToBytes32Array(
    bytes memory data
  ) internal pure returns (bytes32[] memory) {
    // Find 32 bytes segments nb
    uint256 dataNb = data.length / 32;
    // Create an array of dataNb elements
    bytes32[] memory dataList = new bytes32[](dataNb);
    // Start array index at 0
    uint256 index = 0;
    // Loop all 32 bytes segments
    for (uint256 i = 32; i <= data.length; i = i + 32) {
      bytes32 temp;
      // Get 32 bytes from data
      assembly {
        temp := mload(add(data, i))
      }
      // Add extracted 32 bytes to list
      dataList[index] = temp;
      index++;
    }
    // Return data list
    return (dataList);
  }
}
