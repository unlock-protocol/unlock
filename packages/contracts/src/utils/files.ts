const fs = require('fs-extra')
const path = require('path')

export const listFiles = async (folderName: string) => {
  const folderPath = path.resolve('src', folderName)

  if (!(await fs.pathExists(folderPath)))
    throw new Error(`path not found: ${folderPath}`)

  let files
  try {
    files = await fs.readdir(folderPath)
  } catch (err) {
    console.log(err)
  }
  return files
}

export const parseExports = async (folderName: string) => {
  const files = await listFiles(folderName)
  const exportsList = files
    .filter((f: string) => f.includes('.json'))
    .map((f: string) => `./${folderName}/${f}`)

  // make sure all paths exists
  await Promise.all(
    exportsList.map((f: string) => fs.pathExists(path.resolve(f)))
  )

  return exportsList
}

export const getAbiPaths = async () => {
  const folders = ['abis/PublicLock', 'abis/Unlock', 'abis/UnlockDiscountToken']

  const paths = await Promise.all(folders.map((f) => parseExports(f)))
  return paths
}
