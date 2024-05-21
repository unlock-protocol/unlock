// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable5/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/governance/extensions/GovernorTimelockControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable5/proxy/utils/Initializable.sol";

/// @custom:security-contact hello@unlock-protocol.com
contract UPGovernor is
  Initializable,
  GovernorUpgradeable,
  GovernorSettingsUpgradeable,
  GovernorCountingSimpleUpgradeable,
  GovernorVotesUpgradeable,
  GovernorTimelockControlUpgradeable
{
  uint private _quorum;

  // add custom event for quorum changes
  event QuorumSet(uint oldVotingDelay, uint newVotingDelay);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    IVotes _token,
    TimelockControllerUpgradeable _timelock
  ) public initializer {
    __Governor_init("UnlockProtocolGovernor");
    __GovernorSettings_init(43200 /* 6 day */, 43200 /* 6 days */, 0);
    __GovernorCountingSimple_init();
    __GovernorVotes_init(_token);
    __GovernorTimelockControl_init(_timelock);

    // default quorum set to 30k
    _quorum = 30000e18;
  }

  // quorum set to 30k
  function quorum(uint256) public view override returns (uint256) {
    return _quorum;
  }

  // helper to change quorum
  function setQuorum(uint256 newQuorum) public onlyGovernance {
    uint256 oldQuorum = _quorum;
    _quorum = newQuorum;
    emit QuorumSet(oldQuorum, newQuorum);
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
