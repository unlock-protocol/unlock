import { getAbiPaths } from './files'

async function main() {
  const paths = await getAbiPaths()
  const exports = paths.flat().map((abiPath) => {
    const s = abiPath.split('/')
    const contractName = s[2]
    const versionNumber = s[3].replace(contractName, '').replace('.json', '')
    return {
      contractName,
      versionNumber,
      abiPath,
    }
  })

  console.log("// This file is generated, please don't edit directly")
  console.log("// Refer to 'utils/parser.ts' and 'yarn build:index' for more\n")

  exports.forEach(({ contractName, versionNumber, abiPath }) =>
    console.log(`import ${contractName}${versionNumber} from '${abiPath}'`)
  )

  const utils = [
    'LockSerializer',
    'UnlockSwapPurchaser',
    'UnlockSwapBurner',
    'UniswapOracleV3',
  ]

  utils.forEach((util) => {
    console.log(`import ${util} from './abis/utils/${util}.json'`)
  })

  console.log('\n// exports')

  exports.forEach(({ contractName, versionNumber }) =>
    console.log(`export { ${contractName}${versionNumber} }`)
  )

  console.log(`export { ${utils.toString()} }`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
