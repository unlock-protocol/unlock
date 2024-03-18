import { getAbiPaths } from './files'

type contractVersion = {
  contractName: string
  versionNumber: string
  abiPath: string
}

const findLatest = (exports: contractVersion[], contract: string) => {
  const [latest] = exports
    .filter(({ contractName }) => contractName === contract)
    .sort(
      ({ versionNumber: a }, { versionNumber: b }) =>
        parseInt(b.replace('V', '')) - parseInt(a.replace('V', ''))
    )
  const { contractName, versionNumber } = latest
  const varName = `${contract.toLocaleUpperCase()}_LATEST_VERSION`
  const versionInt = versionNumber.replace('V', '')

  console.log(`export { ${contractName}${versionNumber} as ${contract} }`)
  console.log(`const ${varName} = ${versionInt}`)
  console.log(`export { ${varName} }`)
  return latest
}

async function main() {
  const paths = await getAbiPaths()
  const exports: contractVersion[] = paths.flat().map((abiPath) => {
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

  // alias for the newest versions
  console.log('\n// latest')
  findLatest(exports, 'PublicLock')
  findLatest(exports, 'Unlock')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
