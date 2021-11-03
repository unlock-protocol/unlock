const ethers = require('ethers')

const tokenRecipientAddress = '0x8d533d1A48b0D5ddDEF513A0B0a3677E991F3915' // ramdomly generated
const proposerAddress = '0x9d3ea9e9adde71141f4534db3b9b80df3d03ee5f'

module.exports = {
  contractName: 'UnlockDiscountTokenV2',
  functionName: 'transfer',
  functionArgs: [tokenRecipientAddress, ethers.utils.parseUnits('0.01', 18)],
  proposalName: '#000 This is just an example!',
  proposerAddress,
  // NB: no payable value specified (defaulted to 0)
}
