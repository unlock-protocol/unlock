import fs from 'fs-extra'

// this is used to read a network
const run = async () => {
  const [networkInfoPath] = process.argv.slice(2)
  const networkInfo = await fs.readJSON(networkInfoPath)
  const {
    localhost: {
      Unlock: { address: unlockAddress },
    },
  } = networkInfo
  return unlockAddress
}

run()
  .then((unlockAddress) => console.log(unlockAddress))
  .catch((err) => {
    throw err
  })
