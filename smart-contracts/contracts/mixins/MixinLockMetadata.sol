pragma solidity 0.5.11;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'openzeppelin-eth/contracts/introspection/ERC165.sol';
import '../interfaces/IERC721.sol';
import '../UnlockUtils.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';

/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  IERC721,
  ERC165,
  Ownable,
  MixinLockCore,
  UnlockUtils,
  MixinKeys
{
  /// A descriptive name for a collection of NFTs in this contract.Defaults to "Unlock-Protocol" but is settable by lock owner
  string public name;

  /// An abbreviated name for NFTs in this contract. Defaults to "KEY" but is settable by lock owner
  string private lockSymbol;

  // the base Token URI for this Lock. If not set by lock owner, the global URI stored in Unlock is used.
  string private baseTokenURI;

  event NewLockSymbol(
    string symbol
  );

  constructor(
    string memory _lockName
  ) internal
  {
    ERC165.initialize();
    name = _lockName;
    // registering the optional erc721 metadata interface with ERC165.sol using
    // the ID specified in the standard: https://eips.ethereum.org/EIPS/eip-721
    _registerInterface(0x5b5e139f);
  }

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   */
  function updateLockName(
    string calldata _lockName
  ) external
    onlyOwner
  {
    name = _lockName;
  }

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   */
  function updateLockSymbol(
    string calldata _lockSymbol
  ) external
    onlyOwner
  {
    lockSymbol = _lockSymbol;
    emit NewLockSymbol(_lockSymbol);
  }

  /**
    * @dev Gets the token symbol
    * @return string representing the token name
    */
  function symbol()
    external view
    returns(string memory)
  {
    if(bytes(lockSymbol).length == 0) {
      return unlockProtocol.globalTokenSymbol();
    } else {
      return lockSymbol;
    }
  }

  /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   */
  function setBaseTokenURI(
    string calldata _baseTokenURI
  ) external
    onlyOwner
  {
    baseTokenURI = _baseTokenURI;
  }

  /**  @notice A distinct Uniform Resource Identifier (URI) for a given asset.
   * @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
   *  3986. The URI may point to a JSON file that conforms to the "ERC721
   *  Metadata JSON Schema".
   * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
   */
  function tokenURI(
    uint256 _tokenId
  ) external
    view
    isKey(_tokenId)
    returns(string memory)
  {
    string memory URI;
    if(bytes(baseTokenURI).length == 0) {
      URI = unlockProtocol.globalBaseTokenURI();
    } else {
      URI = baseTokenURI;
    }

    return UnlockUtils.strConcat(
      URI,
      UnlockUtils.address2Str(address(this)),
      '/',
      UnlockUtils.uint2Str(_tokenId)
    );
  }
}
