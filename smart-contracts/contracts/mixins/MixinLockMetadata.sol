pragma solidity 0.5.7;

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import '../interfaces/IERC721.sol';
import '../UnlockUtils.sol';
import 'MixinKeys.sol';


/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  IERC721,
  Ownable
{
  /// A descriptive name for a collection of NFTs in this contract
  string private lockName;

  /// An abbreviated name for NFTs in this contract
  string private lockSymbol;

  /// A distinct Uniform Resource Identifier (URI) for a given asset.
  string private baseTokenURI;

  /// temporary hardcoded URI for testing.
  string public constant BASE_TOKEN_URI = 'https://locksmith.unlock-protocol.com/api/key/';

  /**
   * Allows the Lock owner to assign a descriptive name for this Lock.
   */
  function updateLockName(
    string calldata _lockName
  ) external
    onlyOwner
  {
    lockName = _lockName;
  }

  /**
    * @dev Gets the token name
    * @return string representing the token name
    */
  function name(
  ) external view
    returns (string memory)
  {
    return lockName;
  }

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   */
  function updateLockSymbol(
    string calldata _lockSymbol // can/should we enforce uppercase in the ui?
  ) external
    onlyOwner
  {
    lockSymbol = _lockSymbol;
  }

  /**
    * @dev Gets the token symbol
    * @return string representing the token name
    */
  function symbol(
  ) external view
    returns (string memory)
  {
    return lockSymbol;
  }

  /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   */
  function updateBaseTokenURI(
    string calldata _baseTokenURI // can/should we enforce uppercase in the ui?
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
      returns (string)
    {
      return UnlockUtils.strConcat(
            BASE_TOKEN_URI, // TODO: Switch this to baseTokenURI when ready
            UnlockUtils.uint2str(_tokenId)
        );
    }
}
