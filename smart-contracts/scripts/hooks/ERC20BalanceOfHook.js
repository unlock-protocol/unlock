const { ethers, run } = require('hardhat')

async function main() {
  const ERC20BalanceOfHook = await ethers.getContractFactory(
    'ERC20BalanceOfHook'
  )
  const hook = await ERC20BalanceOfHook.deploy()
  await hook.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `HOOK (ERC20 BalanceOf)  > deployed to : ${hook.address} (tx: ${hook.deployTransaction.hash})`
  )

  await run('verify:verify', {
    address: hook.address,
  })
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
