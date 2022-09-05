import { unlock } from 'hardhat'

async function main() {
  await unlock.deployProtocol()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
