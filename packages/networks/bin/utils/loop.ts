import path from 'path'
import fs from 'fs-extra'

export const getAllNetworks = async ({
  exclude = [],
}: {
  exclude: number[]
}) => {
  const fileList = await fs.readdir('./src/networks')
  const networks = await Promise.all(
    fileList
      // ignore localhost
      .filter((f) => !f.includes('localhost') && !f.includes('index'))
      .map(async (f) => {
        const resolvedPath = path.resolve('src/networks', f)
        const { default: network } = await import(resolvedPath)
        return {
          filePath: f,
          network,
          path,
        }
      })
  )
  return networks.filter(({ network }) => !exclude.includes(network.id))
}
