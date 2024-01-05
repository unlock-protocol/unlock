const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')

// use hardhat default local address for testing
const proposerAddress = '0x9dED35Aef86F3c826Ff8fe9240f9e7a9Fb2094e5'

module.exports = {
  proposalName: 'Marketing unlock - david moderator',
  calls: [
    {
      contractNameOrAbi: UnlockDiscountTokenV2.abi,
      functionName: 'transfer',
      proposerAddress,
      calldata:
        '0xa9059cbb0000000000000000000000000235545f679b133543607c66988d60d772c10d4f000000000000000000000000000000000000000000000028a857425466f80000',
    },
  ],
  proposalId:
    '37202134190166629205488218948304157165039720629385438272490277472742730829605',
}
