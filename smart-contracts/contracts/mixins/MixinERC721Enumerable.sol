pragma solidity 0.5.11;

import './MixinERC721Enumerable.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import '../interfaces/IERC721Enumerable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/introspection/ERC165.sol';


/**
 * @title Implements the ERC-721 Enumerable extension.
 */
contract MixinERC721Enumerable is
  IERC721Enumerable,
  ERC165,
  MixinLockCore, // Implements totalSupply
  MixinKeys
{
  function initialize() public
  {
    /**
     * register the supported interface to conform to ERC721Enumerable via ERC165
     * 0x780e9d63 ===
     *     bytes4(keccak256('totalSupply()')) ^
     *     bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
     *     bytes4(keccak256('tokenByIndex(uint256)'))
     */
    _registerInterface(0x780e9d63);
  }

  /// @notice Enumerate valid NFTs
  /// @dev Throws if `_index` >= `totalSupply()`.
  /// @param _index A counter less than `totalSupply()`
  /// @return The token identifier for the `_index`th NFT,
  ///  (sort order not specified)
  function tokenByIndex(
    uint256 _index
  ) external view
    returns (uint256)
  {
    require(_index < totalSupply, 'OUT_OF_RANGE');
    return _index;
  }

  /// @notice Enumerate NFTs assigned to an owner
  /// @dev Throws if `_index` >= `balanceOf(_owner)` or if
  ///  `_owner` is the zero address, representing invalid NFTs.
  /// @param _owner An address where we are interested in NFTs owned by them
  /// @param _index A counter less than `balanceOf(_owner)`
  /// @return The token identifier for the `_index`th NFT assigned to `_owner`,
  ///   (sort order not specified)
  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  ) external view
    returns (uint256)
  {
    require(_index == 0, 'ONLY_ONE_KEY_PER_OWNER');
    return getTokenIdFor(_owner);
  }
}