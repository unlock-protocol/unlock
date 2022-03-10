// use hardhat default local address for testing
const proposerAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

module.exports = {
  contractName: 'UnlockDiscountTokenV3',
  functionName: 'transfer',
  proposalName: 'Marketing unlock - david moderator',
  proposerAddress,
  calldata:
    '0xa9059cbb0000000000000000000000000235545f679b133543607c66988d60d772c10d4f000000000000000000000000000000000000000000000028a857425466f80000',
}
