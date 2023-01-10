// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

// Hardcoding the lendKey interface
interface IPublicLockForKeyManager {
  function lendKey(address from, address to, uint tokenId) external;
}

error NOT_AUTHORIZED();
error TOO_LATE();

/// @custom:security-contact hello@unlock-protocol.com
contract KeyManager is Initializable, OwnableUpgradeable {
  address public locksmith;

  event LocksmithChanged(address indexed locksmith);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {
    __Ownable_init();
  }

  /**
   * Function to transfer given membershipfrom a lock and token.
   * This requires a deadline and transferCode (signature)
   */
  function transfer(
    address lock,
    uint token,
    address owner,
    uint deadline,
    bytes memory transferCode
  ) public {
    if (block.timestamp > deadline) {
      revert TOO_LATE();
    }

    bytes32 hash = keccak256(
      abi.encode(lock, token, owner, deadline, msg.sender)
    );
    if (!SignatureChecker.isValidSignatureNow(locksmith, hash, transferCode)) {
      revert NOT_AUTHORIZED();
    }

    return IPublicLockForKeyManager(lock).lendKey(owner, msg.sender, token);
  }

  /**
   * Function to change the signer. This can only be called by the owner.
   */
  function setLocksmith(address _locksmith) public onlyOwner {
    locksmith = _locksmith;
    emit LocksmithChanged(locksmith);
  }
}
