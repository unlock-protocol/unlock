const fs = require('fs-extra');
import path from 'path'
import { getAbiPaths } from './files'

const keysToKeep = [
  "contractName",
  "abi",
  "bytecode",
  "deployedBytecode",
  "compiler",
  "schemaVersion",
  "updatedAt"
]

export interface ContractAbi {
  contractName: string;
  abi: Array<{}>;
  bytecode : string;
  deployedBytecode : string;
  compiler : string;
  schemaVersion : string;
  updatedAt : string;
}

// remove unused data
async function main() {
  
  const paths = await getAbiPaths()
  console.log(paths)
  paths.flat().forEach(abiPath => {
    
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
      fs.writeJsonSync(abiFullPath, lighter)
    }
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })