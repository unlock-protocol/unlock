// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "hardhat/console.sol";

// Hardcoding the lendKey interface
interface IPublicLockForKeyManager {
  function lendKey(address from, address to, uint tokenId) external;
}

error NOT_AUTHORIZED();
error TOO_LATE();

/// @custom:security-contact hello@unlock-protocol.com
contract KeyManager is Initializable, OwnableUpgradeable, EIP712Upgradeable {
  address public locksmith;

  event LocksmithChanged(address indexed locksmith);

  // solhint-disable-next-line var-name-mixedcase
  bytes32 private constant _TRANSFER_TYPEHASH =
    keccak256("Transfer(address lock,uint token,address owner,uint deadline)");

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {
    __Ownable_init();
    __EIP712_init("KeyManager", "1");
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

    bytes32 structHash = keccak256(
      abi.encode(_TRANSFER_TYPEHASH, lock, token, owner, deadline)
    );

    bytes32 hash = _hashTypedDataV4(structHash);

    address signer = ECDSAUpgradeable.recover(hash, transferCode);

    console.log(signer);
    console.log(locksmith);
    if (signer != locksmith) {
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
