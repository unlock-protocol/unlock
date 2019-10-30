/* eslint-disable no-console */
var fs = require('fs')
const ethers = require('ethers')

var testErc20Token = JSON.parse(
  fs.readFileSync(__dirname + '/TestErc20Token.json', 'utf8')
)

const ERC20_MINT_AMOUNT = '500'

/**
 * This function transfers 10 Eth to the recipient from the first Unlocked account on the node
 * Note: by default the account on the node have 100 Eth. So this will fail if there are more
 * than 10 recipient.
 * @param {*} provider
 * @param {*} recipients
 */
async function transferEth(provider, recipients) {
  let wallet = await provider.getSigner(0)
  const bootstrapTransferAmount = '10.0'

  await recipients.map(async recipient => {
    console.log(`TRANSFER OF ${bootstrapTransferAmount} ETH TO ${recipient}`)
    await wallet.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(bootstrapTransferAmount),
    })
  })
}

/**
 * This function deploys an ERC20 token contract
 * And assigns ERC20_MINT_AMOUNT ERC20 to the recipient
 * @param {*} provider
 * @param {*} recipient
 */
async function setUpERC20Token(provider, recipients) {
  let wallet = await provider.getSigner(0)

  let factory = new ethers.ContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    wallet
  )

  let testERC20 = await factory.deploy({ gasLimit: 6000000 })
  await testERC20.deployed()

  // Once deployed, let's mint some for the recipients
  // This is required because the ERC20 Locks check the supply
  await recipients.map(async recipient => {
    console.log(`MINTING ${ERC20_MINT_AMOUNT} FOR ${recipient}`)
    await testERC20.mint(
      recipient,
      ethers.utils.parseUnits(ERC20_MINT_AMOUNT, 18),
      {
        gasLimit: 6000000,
      }
    )
  })

  return testERC20
}

/**
 * The function deploys a lock and yields the transaction hash immediately
 * for monitoring with monitorLockDeploy
 * @param {*} wallet
 * @param {*} account
 * @param {*} lock
 */
async function deployLock(wallet, lock) {
  const lockAddress = await wallet.createLock(lock)
  console.log(`${lock.name.toUpperCase()} DEPLOYED AT ${lockAddress}`)
  return lockAddress
}

/**
 * The function adds an allowance to the lock so that it can withdraw ERC20 tokens
 * from the purchaseAddress
 * @param {*} provider
 * @param {*} purchaserAddress
 * @param {*} erc20ContractAddress
 * @param {*} lockAddress
 */
async function approveLockToWithdrawFromPurchaser(
  provider,
  purchaserAddress,
  erc20ContractAddress,
  lockAddress
) {
  let contract = new ethers.Contract(
    erc20ContractAddress,
    testErc20Token.abi,
    provider
  )

  let purchaserWallet = provider.getSigner(purchaserAddress)
  let contractWPurchaser = contract.connect(purchaserWallet)
  let approvaltx = await contractWPurchaser.approve(
    lockAddress,
    ethers.utils.parseUnits(ERC20_MINT_AMOUNT, 18) // TODO: read the actual decimal from the contract (even though this one is absolute 18)
  )
  await approvaltx.wait(2) // WHY?
  console.log(
    `APPROVED ${lockAddress} TO WITHDRAW UP TO ${ERC20_MINT_AMOUNT} FROM ${purchaserAddress}`
  )
  return approvaltx.hash
}

/**
 * This function prepares the environment by:
 * 0. Transfers some Eth to
 *  a. recipientAddress (a regular Ethereum user)
 *  b. purchaserAddress (the locksmith user which purchases keys on behalf of users, to pay for gas)
 * 1. Deploying an ERC20 lock and assigning some ERC20 to the following
 *  a. recipientAddress (a regular Ethereum user)
 *  b. purchaserAddress (the locksmith user which purchases keys on behalf of users)
 * 2. Deploys an Ether Lock (it will be owned by the first unlocked user on the node)
 * 3. Deploys an ERC20 Lock (it will be owned by the first unlocked user on the node)
 * 4. Deploys 8 more locks used in integration tests (all will be owned by the first unlocked user on the node)
 * 5. Approves the ERC20 Lock to withdraw from the locksmith users' balance on the ERC20 contract
 * 6. Approves the integration test ERC20 Locks to withdraw from the locksmith users' balance on the ERC20 contract
 * @param {*} web3Service
 * @param {*} wallet
 * @param {*} account
 * @param {*} provider
 * @param {*} purchaserAddress
 * @param {*} recipientAddress
 */
async function prepareEnvironment(
  web3Service,
  wallet,
  account,
  provider,
  purchaserAddress,
  recipientAddress
) {
  await transferEth(provider, [recipientAddress, purchaserAddress])

  let testERC20Token = await setUpERC20Token(provider, [
    recipientAddress,
    purchaserAddress,
  ])
  console.log(`ERC20 CONTRACT DEPLOYED AT ${testERC20Token.address}`)

  // all locks will be deployed in parallel
  const locks = [
    {
      expirationDuration: 300,
      keyPrice: '0.01',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH Lock',
    },
    {
      expirationDuration: 60,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
      name: 'ERC20 Lock',
    },
    {
      expirationDuration: 300,
      keyPrice: '0.1',
      maxNumberOfKeys: '1000',
      currencyContractAddress: null,
      name: 'ETH paywall lock',
    },
    {
      expirationDuration: 300,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
      name: 'ERC20 paywall lock',
    },
    {
      expirationDuration: 604800,
      keyPrice: '0.01',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 1',
    },
    {
      expirationDuration: 2592000,
      keyPrice: '0.05',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 2',
    },
    {
      expirationDuration: 31536000,
      keyPrice: '0.1',
      maxNumberOfKeys: -1,
      currencyContractAddress: null,
      name: 'ETH adblock lock 3',
    },
    {
      expirationDuration: 604800,
      keyPrice: '1',
      maxNumberOfKeys: -1,
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
      name: 'ERC20 adblock lock 1',
    },
    {
      expirationDuration: 2592000,
      keyPrice: '5',
      maxNumberOfKeys: -1,
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
      name: 'ERC20 adblock lock 2',
    },
    {
      expirationDuration: 31536000,
      keyPrice: '100',
      maxNumberOfKeys: -1,
      currencyContractAddress: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
      name: 'ERC20 adblock lock 3',
    },
  ]

  // Deploy all locks
  await Promise.all(
    locks.map(async lock => {
      lock.address = await deployLock(wallet, lock)
    })
  )

  // We now need to approve all ERC20 locks for the locksmith purchaser
  await Promise.all(
    locks
      .filter(lock => {
        !!lock.currencyContractAddress
      })
      .map(lock => {
        approveLockToWithdrawFromPurchaser(
          provider,
          purchaserAddress,
          lock.erc20ContractAddress,
          lock.address
        )
      })
  )
}

module.exports = {
  prepareEnvironment,
}
