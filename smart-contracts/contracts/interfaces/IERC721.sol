pragma solidity 0.4.24;

// n44o: needed?
// import "./IERC165.sol";

/**
 * @title ERC721 Non-Fungible Token Standard basic interface
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
 */
 // n44o: needed?
// contract IERC721 is IERC165 {
contract IERC721 {
  event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId
  );
  event Approval(
    address indexed owner,
    address indexed approved,
    uint256 indexed tokenId
  );
  event ApprovalForAll(
    address indexed owner,
    address indexed operator,
    bool approved
  );

  function balanceOf(address owner) public view returns (uint256 balance);

  function ownerOf(uint256 tokenId) public view returns (address owner);

  function approve(address to, uint256 tokenId) public;

  function getApproved(uint256 tokenId)
    public view returns (address operator);

  function transferFrom(address from, address to, uint256 tokenId) public;

  // function setApprovalForAll(address operator, bool _approved) public;

  // function isApprovedForAll(address owner, address operator)
  //   public view returns (bool);

  // function safeTransferFrom(address from, address to, uint256 tokenId)
  //   public;

  // function safeTransferFrom(
  //   address from,
  //   address to,
  //   uint256 tokenId,
  //   bytes data
  // )
  //   public;
}