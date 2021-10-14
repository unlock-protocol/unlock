// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


// https://github.com/OpenZeppelin/openzeppelin-sdk/blob/master/packages/lib/contracts/upgradeability/ProxyFactory.sol
library Clone2Probe
{
  function getClone2Address(
    address target,
    bytes32 salt
  ) internal view
    returns (address cloneAddress)
  {
    // solium-disable-next-line
    assembly
    {
      let pointer := mload(0x40)

      // Create the bytecode for deployment based on the Minimal Proxy Standard (EIP-1167)
      mstore(pointer, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(pointer, 0x14), shl(96, target))
      mstore(add(pointer, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

      // Calculate the hash
      let contractCodeHash := keccak256(pointer, 0x37)

      // 0xff
      mstore(pointer, 0xff00000000000000000000000000000000000000000000000000000000000000)
      // this (byte 1 - 21)
      mstore(add(pointer, 0x1), shl(96, address()))

      // salt
      mstore(add(pointer, 0x15), salt)

      // hash
      mstore(add(pointer, 0x35), contractCodeHash)

      cloneAddress := keccak256(pointer, 0x55)
    }
  }
}
