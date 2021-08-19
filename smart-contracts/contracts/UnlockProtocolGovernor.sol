// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import '@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/governance/extensions/GovernorTimelockControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract UnlockProtocolGovernor is Initializable,
  GovernorUpgradeable,
  GovernorCountingSimpleUpgradeable,
  GovernorVotesUpgradeable,
  GovernorTimelockControlUpgradeable
  {
  function initialize(ERC20VotesUpgradeable _token, TimelockControllerUpgradeable _timelock)
    public initializer
  {
    __Governor_init('Unlock Protocol Governor');
    __GovernorCountingSimple_init();
    __GovernorVotes_init(_token);
    __GovernorTimelockControl_init(_timelock);
  }

  function votingDelay() public pure override returns (uint256) {
    return 1; // 1 block
  }

  function votingPeriod() public pure override returns (uint256) {
    return 45818; // 1 week
  }

  function quorum(uint256 blockNumber) public pure override returns (uint256) {
    return 15000e18;
  }

  // The following functions are overrides required by Solidity.
  function getVotes(address account, uint256 blockNumber)
    public
    view
    override(IGovernorUpgradeable, GovernorVotesUpgradeable)
    returns (uint256)
  {
    return super.getVotes(account, blockNumber);
  }

  function state(uint256 proposalId)
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (ProposalState)
  {
    return super.state(proposalId);
  }

  function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
    public
    override(GovernorUpgradeable, IGovernorUpgradeable)
    returns (uint256)
  {
    return super.propose(targets, values, calldatas, description);
  }

  function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
  {
    super._execute(proposalId, targets, values, calldatas, descriptionHash);
  }

  function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
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

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(GovernorUpgradeable, GovernorTimelockControlUpgradeable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
