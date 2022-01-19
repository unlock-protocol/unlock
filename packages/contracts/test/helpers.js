const fs = require('fs-extra')

const listAllContracts = (contractName) => {
  return fs.readdirSync(`./src/contracts/${contractName}/`)
}

module.exports = {
  listAllContracts
}