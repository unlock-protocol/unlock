// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable5/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";
import {NoncesUpgradeable} from "@openzeppelin/contracts-upgradeable5/utils/NoncesUpgradeable.sol";

interface IUPSwap {
  function setUp() external;
}

/// @custom:security-contact hello@unlock-protocol.com
contract UPToken is
  Initializable,
  ERC20Upgradeable,
  ERC20PermitUpgradeable,
  ERC20VotesUpgradeable,
  OwnableUpgradeable
{
  uint public constant TOTAL_SUPPLY = 1_000_000_000;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address initialOwner) public initializer {
    __ERC20_init("UnlockProtocolToken", "UP");
    __ERC20Permit_init("UnlockProtocolToken");
    __ERC20Votes_init();
    __Ownable_init(initialOwner);
  }

  function mint(address upSwap) public onlyOwner {
    if (balanceOf(upSwap) == 0) {
      // premint the supply
      _mint(upSwap, TOTAL_SUPPLY * 10 ** decimals());
    }
  }

  // required to base votes on timestamp instead of blocks
  function clock() public view override returns (uint48) {
    return uint48(block.timestamp);
  }

  // solhint-disable-next-line func-name-mixedcase
  function CLOCK_MODE() public pure override returns (string memory) {
    return "mode=timestamp";
  }

  // The following functions are overrides required by Solidity.

  function _update(
    address from,
    address to,
    uint256 value
  ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
    super._update(from, to, value);
  }

  function nonces(
    address owner
  )
    public
    view
    override(ERC20PermitUpgradeable, NoncesUpgradeable)
    returns (uint256)
  {
    return super.nonces(owner);
  }
}
