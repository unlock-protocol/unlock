import { getAbiPaths } from './files'

type contractVersion = {
  contractName: string
  versionNumber: string
  abiPath: string
}

const PUBLICLOCK_LATEST_VERSION = 14
const UNLOCK_LATEST_VERSION = 13

const exportLatest = (contract: string, versionNumber: number) => {
  const varName = `${contract.toLocaleUpperCase()}_LATEST_VERSION`

  console.log(`export { ${contract}V${versionNumber} as ${contract} }`)
  console.log(`const ${varName} = ${versionNumber}`)
  console.log(`export { ${varName} }`)
}

async function main() {
  const paths = await getAbiPaths()
  const exports: contractVersion[] = paths.flat().map((abiPath: string) => {
    let contractName, fileName, versionNumber
    if (abiPath.includes('/utils/')) {
      ;[, , , fileName] = abiPath.split('/')
      contractName = fileName.replace('.json', '')
    } else {
      ;[, , contractName, fileName] = abiPath.split('/')
      versionNumber = fileName.replace(contractName, '').replace('.json', '')
    }
    return {
      contractName,
      versionNumber,
      abiPath,
    }
  })

  console.log("// This file is generated, please don't edit directly")
  console.log("// Refer to 'utils/parser.ts' and 'yarn build:index' for more\n")

  exports.forEach(({ contractName, versionNumber = '', abiPath }) =>
    console.log(`import ${contractName}${versionNumber} from '${abiPath}'`)
  )

  console.log('\n// exports')

  exports.forEach(({ contractName, versionNumber = '' }) =>
    console.log(`export { ${contractName}${versionNumber} }`)
  )

  // alias for all contracts
  console.log(
    `const contracts = { ${exports
      .map(
        ({ contractName, versionNumber = '' }) =>
          `${contractName}${versionNumber}`
      )
      .toString()} } 
      export { contracts }`
  )

  // alias for the newest versions
  console.log('\n// latest')
  exportLatest('PublicLock', PUBLICLOCK_LATEST_VERSION)
  exportLatest('Unlock', UNLOCK_LATEST_VERSION)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
