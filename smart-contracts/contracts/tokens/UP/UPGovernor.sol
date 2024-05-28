// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";

/// @custom:security-contact hello@unlock-protocol.com
contract UPGovernor is
  Initializable,
  GovernorUpgradeable,
  GovernorSettingsUpgradeable,
  GovernorCountingSimpleUpgradeable,
  GovernorVotesUpgradeable,
  GovernorVotesQuorumFractionUpgradeable,
  GovernorTimelockControlUpgradeable
{
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    IVotes _token,
    TimelockControllerUpgradeable _timelock
  ) public initializer {
    __Governor_init("UnlockProtocolGovernor");
    __GovernorSettings_init(6 days, 6 days, 0);
    __GovernorCountingSimple_init();
    __GovernorVotes_init(_token);
    __GovernorVotesQuorumFraction_init(3);
    __GovernorTimelockControl_init(_timelock);
  }

  function quorumDenominator() public pure override returns (uint256) {
    return 1000;
  }

  // The following functions are overrides required by Solidity.

  function votingDelay()
    public
    view
    override(GovernorUpgradeable, GovernorSettingsUpgradeable)
    returns (uint256)
  {
    return super.votingDelay();
  }

  function votingPeriod()
    public
    view
    override(GovernorUpgradeable, GovernorSettingsUpgradeable)
    returns (uint256)
  {
    return super.votingPeriod();
  }

  function state(
    uint256 proposalId
  )
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (ProposalState)
  {
    return super.state(proposalId);
  }

  function proposalNeedsQueuing(
    uint256 proposalId
  )
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (bool)
  {
    return super.proposalNeedsQueuing(proposalId);
  }

  function proposalThreshold()
    public
    view
    override(GovernorUpgradeable, GovernorSettingsUpgradeable)
    returns (uint256)
  {
    return super.proposalThreshold();
  }

  function _queueOperations(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  )
    internal
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (uint48)
  {
    return
      super._queueOperations(
        proposalId,
        targets,
        values,
        calldatas,
        descriptionHash
      );
  }

  function _executeOperations(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(GovernorUpgradeable, GovernorTimelockControlUpgradeable) {
    super._executeOperations(
      proposalId,
      targets,
      values,
      calldatas,
      descriptionHash
    );
  }

  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  )
    internal
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (uint256)
  {
    return super._cancel(targets, values, calldatas, descriptionHash);
  }

  function _executor()
    internal
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (address)
  {
    return super._executor();
  }
}
