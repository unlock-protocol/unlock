const { ethers } = require('hardhat')

async function main() {
  const ERC1155BalanceOfHook = await ethers.getContractFactory(
    'ERC1155BalanceOfHook'
  )
  const hook = await ERC1155BalanceOfHook.deploy()
  await hook.deployed()

  // eslint-disable-next-line no-console
  console.log(
    `HOOK (ERC1155 BalanceOf)  > deployed to : ${hook.address} (tx: ${hook.deployTransaction.hash})`
  )
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
