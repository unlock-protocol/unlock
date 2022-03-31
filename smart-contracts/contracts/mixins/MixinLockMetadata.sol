// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol';
// import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
import '../UnlockUtils.sol';
import './MixinKeys.sol';
import './MixinLockCore.sol';
import './MixinRoles.sol';

/**
 * @title Mixin for metadata about the Lock.
 * @author HardlyDifficult
 * @dev `Mixins` are a design pattern seen in the 0x contracts.  It simply
 * separates logically groupings of code to ease readability.
 */
contract MixinLockMetadata is
  ERC165StorageUpgradeable,
  MixinRoles,
  MixinLockCore,
  MixinKeys
{
  using UnlockUtils for uint;
  using UnlockUtils for address;

  /// A descriptive name for a collection of NFTs in this contract.Defaults to "Unlock-Protocol" but is settable by lock owner
  string public name;

  /// An abbreviated name for NFTs in this contract. Defaults to "KEY" but is settable by lock owner
  string private lockSymbol;

  // the base Token URI for this Lock. If not set by lock owner, the global URI stored in Unlock is used.
  string private baseTokenURI;

  event NewLockSymbol(
    string symbol
  );

  function _initializeMixinLockMetadata(
    string calldata _lockName
  ) internal
  {
    ERC165StorageUpgradeable.__ERC165Storage_init();

    // set default values
    name = _lockName;
    lockSymbol = unlockProtocol.globalTokenSymbol();
    baseTokenURI = string(
      abi.encodePacked(
        unlockProtocol.globalBaseTokenURI(),
        address(this).address2Str(),
        '/'
      )
    );

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
  {
    _onlyLockManager();
    name = _lockName;
  }

  /**
   * Allows the Lock owner to assign a Symbol for this Lock.
   */
  function updateLockSymbol(
    string calldata _lockSymbol
  ) external
  {
    _onlyLockManager();
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
    return lockSymbol;
  }

  /**
   * Allows the Lock owner to update the baseTokenURI for this Lock.
   * @param _baseTokenURI a URL ending with a /
   * @notice if an empty string is passed, then the baseTokenURI is reset to 
   * the default one from the Unlock contract
   */
  function setBaseTokenURI(
    string calldata _baseTokenURI
  ) external
  {
    _onlyLockManager();
    
    // if empty, reset tokenURI to default
    if(bytes(_baseTokenURI).length == 0) {
      baseTokenURI = string(
        abi.encodePacked(
          unlockProtocol.globalBaseTokenURI(),
          address(this).address2Str(),
          '/'
        )
      );
    } else {
      baseTokenURI = _baseTokenURI;
    }
  }

  /**  @notice A distinct Uniform Resource Identifier (URI) for a given asset.
   * @param _tokenId The iD of the token  for which we want to retrieve the URI.
   * If 0 is passed here, we just return the appropriate baseTokenURI.
   * If a custom URI has been set we don't return the lock address.
   * It may be included in the custom baseTokenURI if needed.
   * @dev  URIs are defined in RFC 3986. The URI may point to a JSON file
   * that conforms to the "ERC721 Metadata JSON Schema".
   * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
   */
  function tokenURI(
    uint256 _tokenId
  ) external
    view
    returns(string memory _tokenURI)
  {
    if(address(onTokenURIHook) != address(0))
    {
      return onTokenURIHook.tokenURI(
        address(this),
        msg.sender,
        ownerOf(_tokenId),
        _tokenId,
        keyExpirationTimestampFor(_tokenId)
        );
    }

    return string(
      abi.encodePacked(
        baseTokenURI,
        _tokenId != 0 ? _tokenId.uint2Str() : ''
      )
    );
  }

  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(
      AccessControlUpgradeable,
      ERC165StorageUpgradeable
    ) 
    returns (bool) 
    {
    return super.supportsInterface(interfaceId);
  }

  uint256[1000] private __safe_upgrade_gap;
}