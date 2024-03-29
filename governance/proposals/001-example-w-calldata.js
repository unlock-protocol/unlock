const { UnlockDiscountTokenV2 } = require('@unlock-protocol/contracts')

module.exports = {
  proposalName: 'Marketing unlock - david moderator',
  calls: [
    {
      contractNameOrAbi: UnlockDiscountTokenV2.abi,
      functionName: 'transfer',
      calldata:
        '0xa9059cbb0000000000000000000000000235545f679b133543607c66988d60d772c10d4f000000000000000000000000000000000000000000000028a857425466f80000',
    },
  ],
  proposalId:
    '37202134190166629205488218948304157165039720629385438272490277472742730829605',
}
