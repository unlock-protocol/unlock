// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IOptimismMintableERC20
/// @notice This interface is available on the OptimismMintableERC20 contract.
///         We declare it as a separate interface so that it can be used in
///         custom implementations of OptimismMintableERC20.
interface IOptimismMintableERC20 is IERC165 {
  function remoteToken() external view returns (address);

  function bridge() external returns (address);

  function mint(address _to, uint256 _amount) external;

  function burn(address _from, uint256 _amount) external;
}

contract UDTOptimism is IOptimismMintableERC20, ERC20 {
  /// @notice Address of the corresponding version of this token on the remote chain.
  address public immutable REMOTE_TOKEN;

  /// @notice Address of the StandardBridge on this network.
  address public immutable BRIDGE;

  /// @notice Emitted whenever tokens are minted for an account.
  /// @param account Address of the account tokens are being minted for.
  /// @param amount  Amount of tokens minted.
  event Mint(address indexed account, uint256 amount);

  /// @notice Emitted whenever tokens are burned from an account.
  /// @param account Address of the account tokens are being burned from.
  /// @param amount  Amount of tokens burned.
  event Burn(address indexed account, uint256 amount);

  /// @notice A modifier that only allows the bridge to call.
  modifier onlyBridge() {
    require(
      msg.sender == BRIDGE,
      "UnlockDiscountToken: only bridge can mint and burn"
    );
    _;
  }

  /// @param _bridge      Address of the L2 standard bridge.
  /// @param _remoteToken Address of the corresponding L1 token.
  /// @param _name        ERC20 name.
  /// @param _symbol      ERC20 symbol.
  constructor(
    address _bridge,
    address _remoteToken,
    string memory _name,
    string memory _symbol
  ) ERC20(_name, _symbol) {
    REMOTE_TOKEN = _remoteToken;
    BRIDGE = _bridge;
  }

  /// @custom:legacy
  /// @notice Legacy getter for REMOTE_TOKEN.
  function remoteToken() public view returns (address) {
    return REMOTE_TOKEN;
  }

  /// @custom:legacy
  /// @notice Legacy getter for BRIDGE.
  function bridge() public view returns (address) {
    return BRIDGE;
  }

  /// @notice ERC165 interface check function.
  /// @param _interfaceId Interface ID to check.
  /// @return Whether or not the interface is supported by this contract.
  function supportsInterface(
    bytes4 _interfaceId
  ) external pure virtual returns (bool) {
    bytes4 iface1 = type(IERC165).interfaceId;
    // Interface corresponding to the updated OptimismMintableERC20 (this contract).
    bytes4 iface2 = type(IOptimismMintableERC20).interfaceId;
    return _interfaceId == iface1 || _interfaceId == iface2;
  }

  /// @notice Allows the StandardBridge on this network to mint tokens.
  /// @param _to     Address to mint tokens to.
  /// @param _amount Amount of tokens to mint.
  function mint(
    address _to,
    uint256 _amount
  ) external virtual override(IOptimismMintableERC20) onlyBridge {
    _mint(_to, _amount);
    emit Mint(_to, _amount);
  }

  /// @notice Prevents tokens from being withdrawn to L1.
  function burn(
    address,
    uint256
  ) external virtual override(IOptimismMintableERC20) onlyBridge {
    revert("UnlockDiscountToken cannot be withdrawn");
  }
}
