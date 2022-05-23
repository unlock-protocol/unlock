const { ethers, run } = require('hardhat')

async function main() {
  const ERC721BalanceOfHook = await ethers.getContractFactory(
    'ERC721BalanceOfHook'
  )
  const hook = await ERC721BalanceOfHook.deploy()
  await hook.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `HOOK (ERC721 BalanceOf)  > deployed to : ${hook.address} (tx: ${hook.deployTransaction.hash})`
  )

  run('verify:verify', {
    address: hook.address,
  })
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
