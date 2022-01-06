const fs = require('fs-extra');
const path = require('path');

export const listFiles = async (folderName: String) => {

  const folderPath = path.resolve('src', folderName)

  if (!await fs.pathExists(folderPath)) throw new Error(`path not found: ${folderPath}`)

  try {
    const files = await fs.readdir(folderPath);
    return files
  } catch (err) {
    console.log(err);
  }
}

export const parseExports = async (folderName: String) => {
  const files = await listFiles(folderName)
  const _exports = files
    .filter((f: String) => f.includes('.json'))
    .map((f: String) => `./${folderName}/${f}`)

  // make sure all paths exists
  _exports.forEach(async (f: String) => await fs.pathExists(path.resolve(f)))

  return _exports
}

export const getAbiPaths = async () => {

  const folders = [
    'abis/PublicLock',
    'abis/Unlock',
    'abis/UnlockDiscountToken',
  ]

  const paths = await Promise.all(
    folders.map(async f => await parseExports(f))
  )
  return paths
}