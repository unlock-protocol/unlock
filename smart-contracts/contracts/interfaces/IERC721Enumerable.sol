pragma solidity 0.5.10;

/**
 * @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC721Enumerable
{
  function totalSupply(
  ) external view
    returns (uint256);

  function tokenOfOwnerByIndex(
    address _owner,
    uint256 _index
  ) external view
    returns (uint256 _tokenId);

  function tokenByIndex(
    uint256 _index
  ) external view
    returns (uint256);
}
