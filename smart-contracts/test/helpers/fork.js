const { ethers, network, config } = require('hardhat')
const { UDT, unlockAddress, whales } = require('./contracts')
const USDC_ABI = require('../helpers/ABIs/USDC.json')
const { MAX_UINT } = require('./constants')

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
  // provider workaround for hardhat bug
  // see https://github.com/NomicFoundation/hardhat/issues/1226#issuecomment-1181706467
  let provider
  if (network.config.url !== undefined) {
    provider = new ethers.providers.JsonRpcProvider(network.config.url)
  } else {
    // if network.config.url is undefined, then this is the hardhat network
    provider = ethers.provider
  }

  await provider.send('hardhat_impersonateAccount', [address])
  await addSomeETH(address) // give some ETH just in case

  // return signer
  const signer = provider.getSigner(address)
  signer.address = signer._address
  return signer
}

const stopImpersonate = async (address) => {
  await network.provider.request({
    method: 'hardhat_stopImpersonatingAccount',
    params: [address],
  })
}

const addERC20 = async function (
  tokenAddress,
  address,
  amount = ethers.utils.parseEther('1000')
) {
  if (!whales[tokenAddress])
    throw Error(`No whale for this address: ${tokenAddress}`)
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

const delegates = [
  '0x0d8410643ae7a4d833c7219e5c6fadfa5ce912cd',
  '0x6aec5228fda60525f59afc773ada7df6a6d8e43f',
  '0xde22DE740609532FC0F48287b7F258776bE814FD',
]

// main UDT holders on mainnet
const getDelegates = async () => {
  return await Promise.all(delegates.map((delegate) => impersonate(delegate)))
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

const addSomeUSDC = async (usdcAddress, recipientAddress, amount = 1000) => {
  const usdc = await ethers.getContractAt(USDC_ABI, usdcAddress)
  const masterMinter = await usdc.masterMinter()
  await impersonate(masterMinter)
  const minter = await ethers.getSigner(masterMinter)
  await (
    await usdc.connect(minter).configureMinter(recipientAddress, MAX_UINT)
  ).wait()
  await (await usdc.mint(recipientAddress, amount)).wait()
}

module.exports = {
  resetNodeState,
  impersonate,
  stopImpersonate,
  getDelegates,
  getUnlockMainnet,
  getUDTMainnet,
  addUDT,
  addSomeETH,
  addSomeUSDC,
  addERC20,
  delegates,
}
