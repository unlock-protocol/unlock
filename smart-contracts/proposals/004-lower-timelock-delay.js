// lower timelock delay on goerli
module.exports = {
  proposalName: 'Lower minDelay on timelock',
  contractName: 'UnlockProtocolTimelock',
  contractAddress: '0xD7477B7c0CdA4204Cf860e4c27486061b15a5AC3',
  functionName: 'updateDelay',
  functionArgs: [10],
}
