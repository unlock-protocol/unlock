module.exports = () => {
  const calls = [
    {
      contractName: 'UnlockProtocolGovernor',
      contractAddress: '0x15334fe6F1cb0e286E1F9e1268B44E4221E169B7',
      functionName: 'setVotingPeriod',
      functionArgs: [20],
    },
  ]

  const proposalArgs = {
    calls,
    proposalName: `Lower voting period`,
  }
  return proposalArgs
}
