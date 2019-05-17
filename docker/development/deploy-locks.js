var fs = require('fs')
const ethers = require('ethers')

var testErc20Token = JSON.parse(
  fs.readFileSync('/standup/TestErc20Token.json', 'utf8')
)

async function deployTestERC20Token(provider) {
  let wallet = await provider.getSigner(0)

  let factory = new ethers.ContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    wallet
  )

  let testERC20
  try {
    testERC20 = await factory.deploy({ gasLimit: 6000000 })
  } catch (e) {
    console.log(e)
  }

  await testERC20.deployed()
  return testERC20
}

async function mintForAddress(
  contractOwnerCredentials,
  contractAddress,
  recipient,
  provider
) {
  let contract = new ethers.Contract(
    contractAddress,
    testErc20Token.abi,
    provider
  )

  let user0PrivateKey = contractOwnerCredentials
  let wallet = new ethers.Wallet(user0PrivateKey, provider)
  let contractWSigner = contract.connect(wallet)
  let tx = await contractWSigner.mint(recipient, 500, { gasLimit: 6000000 })

  await tx.wait(2)
  return tx.hash
}

async function deployETHLock(wallet, account) {
  await wallet.createLock(
    {
      expirationDuration: 60 * 5, // 1 minute!
      keyPrice: '0.01', // 0.01 Eth
      maxNumberOfKeys: -1, // Unlimited
    },
    account
  )
}

async function deployERC20Lock(wallet, account, contractAddress) {
  await wallet.createLock(
    {
      expirationDuration: 60 * 5, // 1 minute!
      keyPrice: '0.02', // 0.01 Eth
      maxNumberOfKeys: -1, // Unlimited
    },
    account,
    contractAddress
  )
}

async function approveContract(provider, privateKey, contractAddress) {
  let contract = new ethers.Contract(
    contractAddress,
    testErc20Token.abi,
    provider
  )

  let purchaserWallet = new ethers.Wallet(privateKey, provider)
  let contractWPurchaser = contract.connect(purchaserWallet)
  let approvaltx = await contractWPurchaser.approve(contractAddress, 50)
  await approvaltx.wait(2)
  return approvaltx.hash
}

async function prepareEnvironment(
  wallet,
  contractOwnerCredentials,
  account,
  provider,
  pk,
  recipientAddress
) {
  let testERC20Token = await deployTestERC20Token(provider)

  await mintForAddress(
    contractOwnerCredentials,
    testERC20Token.address,
    recipientAddress,
    provider
  )
  await deployERC20Lock(wallet, account, testERC20Token.address)
  await deployETHLock(wallet, account)
  await approveContract(provider, pk, testERC20Token.address)
}

module.exports = {
  prepareEnvironment,
}
