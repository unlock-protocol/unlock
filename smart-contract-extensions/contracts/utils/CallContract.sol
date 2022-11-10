// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/**
 * @title Calls an arbitrary contract function.
 */
library CallContract
{
  function _readUint(
    address _contract,
    bytes memory _callData
  ) internal view
    returns (uint)
  {
    (bool success, bytes memory result) = _contract.staticcall(_callData);
    require(success, 'INTERNAL_CONTRACT_READ_CALL_FAILED');
    return abi.decode(result, (uint));
  }

  function _call(
    address _contract,
    bytes memory _callData,
    uint _ethValue
  ) internal
  {
    bool result;
    // solium-disable-next-line
    assembly
    {
      result := call(
        gas(),
        _contract,
        _ethValue,
        add(_callData, 32), // Start of callData information
        mload(_callData), // Size of callData
        0, // Output ignored
        0 // Output ignored
      )
    }
    require(result, 'INTERNAL_CONTRACT_CALL_FAILED');
  }

  function _callByPosition(
    address _contract,
    bytes memory _callDataConcat,
    uint _startPosition,
    uint _length,
    uint _ethValue
  ) internal
  {
    bool result;
    // solium-disable-next-line
    assembly
    {
      result := call(
        gas(),
        _contract,
        _ethValue,
        add(_callDataConcat, add(32, _startPosition)), // Start of callData information
        _length,
        0, // Output ignored
        0 // Output ignored
      )
    }
    require(result, 'INTERNAL_CONTRACT_CALL_FAILED');
  }
}
