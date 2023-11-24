const { ethers } = require('ethers')
const { UDT, WETH, whales, unlockAddress } = require('./contracts')

const ERC20_ABI = require('./ABIs/erc20.json')
const USDC_ABI = require('./ABIs/USDC.json')
const { abi: WETH_ABI } = require('./ABIs/weth.json')

const { MAX_UINT } = require('./constants')

// parse mainnet fork
const parseForkUrl = (networks, chainId) => {
  chainId = parseInt(process.env.RUN_FORK)
  if (isNaN(chainId)) {
    throw Error(`chain id ('${process.env.RUN_FORK}') should be a number`)
  }
  console.log(`Running a fork (chainId : ${chainId})...`)
  networks.hardhat = {
    chainId,
    forking: {
      url: `https://rpc.unlock-protocol.com/${chainId}`,
    },
  }

  // needed for Uniswap Router to compute routes on local forks
  networks.hardhat.blockGasLimit = 1_000_000_000

  // set the correct chainId to use with local node over RPC
  networks.localhost.chainId = chainId
  networks.localhost.url = 'http://localhost:8545'
}

const resetNodeState = async () => {
  const { ethers, network, config } = require('hardhat')
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
  const { network } = require('hardhat')
  const balance = ethers.utils.hexStripZeros(amount)
  await network.provider.send('hardhat_setBalance', [address, balance])
}

const impersonate = async (address) => {
  const { network } = require('hardhat')
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
  const { network } = require('hardhat')
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
  const { ethers } = require('hardhat')
  // wrapped some ETH
  if (tokenAddress.toLowerCase() === WETH.toLowerCase()) {
    await addSomeETH(address)
    const weth = await ethers.getContractAt(WETH_ABI, WETH)
    await weth.deposit({ value: amount.toString() })
    return weth
  }

  // special for UDT
  if (tokenAddress.toLowerCase() === UDT.toLowerCase()) {
    await addUDT(address, amount)
    return await ethers.getContractAt(ERC20_ABI, UDT)
  }

  // otherwise use transfer from whales
  if (!whales[tokenAddress])
    throw Error(`No whale for this address: ${tokenAddress}`)
  const whale = await ethers.getSigner(whales[tokenAddress])
  await impersonate(whale.address)

  const erc20Contract = await ethers.getContractAt(ERC20_ABI, tokenAddress)
  await erc20Contract.connect(whale).transfer(address, amount)
  return erc20Contract
}

const toBytes32 = (bn) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32))
}

const addUDT = async (recipientAddress, amount = 1000) => {
  const { ethers, network } = require('hardhat')

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

const getERC20Contract = async (tokenAddress) => {
  const { ethers } = require('hardhat')
  const [signer] = await ethers.getSigners()
  return tokenAddress === WETH
    ? await ethers.getContractAt(WETH_ABI, WETH, signer)
    : await ethers.getContractAt(ERC20_ABI, tokenAddress, signer)
}

const addSomeUSDC = async (usdcAddress, recipientAddress, amount = 1000) => {
  const { ethers } = require('hardhat')
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
  getERC20Contract,
  addUDT,
  addSomeETH,
  addSomeUSDC,
  addERC20,
  delegates,
  parseForkUrl,
}
