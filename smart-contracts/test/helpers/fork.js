const { ethers, network, config } = require('hardhat')
const { UDT, unlockAddress, whales } = require('./contracts')

const resetNodeState = async () => {
  // reset fork
  const { forking } = config.networks.hardhat
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: forking.url,
          blockNumber: forking.blockNumber,
        },
      },
    ],
  })
}

const addSomeETH = async (
  address,
  amount = ethers.utils.parseEther('1000')
) => {
  const balance = ethers.utils.hexStripZeros(amount)
  await network.provider.send('hardhat_setBalance', [address, balance])
}

const impersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  })
  await addSomeETH(address) // give some ETH just in case
}

const stopImpersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [address],
  })
}

const addERC20 =  async function (tokenAddress, address, amount = ethers.utils.parseEther('1000')) {
  if(!whales[tokenAddress]) throw Error(`No whale for this address: ${tokenAddress}`)
  const whale = await ethers.getSigner(whales[tokenAddress])
  await impersonate(whale.address)

  const erc20Contract = await ethers.getContractAt('TestERC20', tokenAddress)
  await erc20Contract.connect(whale).transfer(address, amount)
  return erc20Contract
}


const toBytes32 = (bn) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32))
}

const addUDT = async (recipientAddress, amount = 1000) => {
  // UDT contract
  const udtAmount = ethers.utils.parseEther(`${amount}`)

  // NB: slot has been found by using slot20 - see https://kndrck.co/posts/local_erc20_bal_mani_w_hh/
  // Get storage slot index
  const index = ethers.utils.solidityKeccak256(
    ['uint256', 'uint256'],
    [recipientAddress, 51] // key, slot
  )

  // Manipulate local balance (needs to be bytes32 string)
  await network.provider.request({
    method: 'hardhat_setStorageAt',
    params: [UDT, index.toString(), toBytes32(udtAmount).toString()],
  })
  // Just mines to the next block
  await ethers.provider.send('evm_mine', [])
}

const getDictator = async () => {
  // main UDT holder on mainnet
  const udtHolder = '0xa39b44c4affbb56b76a1bf1d19eb93a5dfc2eba9'
  await impersonate(udtHolder)
  const dictator = await ethers.getSigner(udtHolder)
  return dictator
}

const getUnlockMainnet = async () => {
  let unlock = await ethers.getContractAt('Unlock', unlockAddress)

  //impersonate unlock multisig
  const unlockOwner = await unlock.owner()
  await impersonate(unlockOwner)
  const unlockSigner = await ethers.getSigner(unlockOwner)

  unlock = unlock.connect(unlockSigner)
  return unlock
}

const getUDTMainnet = async () => {
  const udt = await ethers.getContractAt('UnlockDiscountTokenV3', UDT)
  return udt
}

module.exports = {
  resetNodeState,
  impersonate,
  stopImpersonate,
  getDictator,
  getUnlockMainnet,
  getUDTMainnet,
  addUDT,
  addSomeETH,
  addERC20,
}
