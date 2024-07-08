import networks from '../src'
import path from 'path'
import fs from 'fs-extra'
import { validateKeys } from './validate'
import * as ts from 'typescript'
import tsconfig from '../tsconfig.json'

console.log(ts)

const validateTypes = async (filePath) => {
  // validate type
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
  const [filePath] = process.argv.slice(2)

  //
  await validateTypes(filePath)
  await validateNewNetwork(path.resolve(filePath))
}

run()
  .then(() => console.log('Done'))
  .catch((err) => {
    throw Error(err)
  })
