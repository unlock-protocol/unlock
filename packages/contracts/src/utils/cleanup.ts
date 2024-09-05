import { ContractAbi } from '@unlock-protocol/types'
// @ts-expect-error:next-line due to the fact that fs-extra is not typed
import fs from 'fs-extra'
import { getAbiPaths } from './files'
/**
 * This script is used to keep only required data in contracts ABI files
 * and remove anything added by Truffle or other building systems.
 *
 * The file can be called directly with `yarn abi:cleanup`
 */
import path from 'path'

const keysToKeep = [
  'contractName',
  'abi',
  'bytecode',
  'deployedBytecode',
  'compiler',
  'schemaVersion',
  'updatedAt',
]

async function main() {
  const paths = await getAbiPaths()
  paths.flat().forEach((abiPath: string) => {
    const abiFullPath = path.resolve('src', abiPath)
    const manifest = fs.readJsonSync(abiFullPath)
    if (Object.keys(manifest).length !== keysToKeep.length) {
      const {
        contractName,
        abi,
        bytecode,
        deployedBytecode,
        compiler,
        schemaVersion,
        updatedAt,
      } = manifest

      const lighter: ContractAbi = {
        contractName,
        abi,
        bytecode,
        deployedBytecode,
        compiler,
        schemaVersion,
        updatedAt,
      }
      console.log('Replacing by a smaller ', abiPath)
      fs.writeJsonSync(abiFullPath, lighter, { spaces: 2 })
    }
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
