pragma solidity 0.5.7;

// This contract provides some utility methods for use with the unlock protocol smart contracts.
// Borrowed from:
// https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol#L943

contract UnlockUtils {

  function strConcat(
    string memory _a,
    string memory _b
  ) public
    pure
    returns(string memory)
 {
    bytes memory _ba = bytes(_a);
    bytes memory _bb = bytes(_b);
    string memory ab = new string(_ba.length + _bb.length);
    bytes memory bab = bytes(ab);
    uint k = 0;
    for(uint i = 0; i < _ba.length; i++) {
      bab[k++] = _ba[i];
    }
    for(uint i = 0; i < _bb.length; i++) {
      bab[k++] = _bb[i];
    }
    return string(bab);
  }

  function uint2Str(
    uint _i
  ) public
    pure
    returns (string memory _uintAsString)
  {
    // make a copy of the param to avoid security/no-assign-params error
    uint c = _i;
    if (_i == 0) {
      return '0';
    }
    uint j = _i;
    uint len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len - 1;
    while (c != 0) {
      bstr[k--] = byte(uint8(48 + c % 10));
      c /= 10;
    }
    return string(bstr);
  }

  function address2Str(
    address _addr
  ) public
    pure
    returns(string memory)
  {
    bytes32 value = bytes32(uint256(_addr));
    bytes memory alphabet = '0123456789abcdef';
    bytes memory str = new bytes(42);
    str[0] = '0';
    str[1] = 'x';
    for (uint i = 0; i < 20; i++) {
      str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
      str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
    }
    return string(str);
  }
}