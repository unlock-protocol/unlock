import networks from '../src'
import path from 'path'
import fs from 'fs-extra'
import { validateKeys } from './helpers'
import * as ts from 'typescript'
import tsconfig from '../tsconfig.json'

// validate ts types
const validateTypes = async (filePath) => {
  const program = ts.createProgram([filePath], tsconfig.compilerOptions)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  for (const diagnostic of diagnostics) {
    if (diagnostic.file?.fileName === filePath) {
      console.log(diagnostic)
      const message = diagnostic.messageText
      console.log(`(${filePath}) ${message}`)
    }
  }
}

const validateNewNetwork = async (networkFilePath) => {
  const networkSlug = path.basename(
    networkFilePath,
    path.extname(networkFilePath)
  )
  const networkId = Object.keys(networks).find(
    (id) => networks[id].chain === networkSlug
  )
  if (networkId) {
    const missingProperties = validateKeys(networks[networkId])
    console.log(missingProperties)
  }
}

const run = async () => {
  // fs
  // const [filePath] = process.argv.slice(2)
  //
  const fileList = await fs.readdir('./src/networks')
  for (const filePath of fileList) {
    console.log(path.resolve('src/networks', filePath))
    await validateTypes(filePath)
  }
  // await validateNewNetwork(path.resolve(filePath))
}

run()
  .then(() => console.log('Done'))
  .catch((err) => {
    throw Error(err)
  })
