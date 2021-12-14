const { ethers } = require('hardhat')

const compareValues = async (serialized, lock) => {
  const arrays = [
    'keyOwners',
    'expirationTimestamps',
    'keyManagers',
    'tokenURISample',
  ]
  const propNames = Object.keys(serialized)
    .filter((k) => Number.isNaN(Number.parseInt(k))) // remove numbers from array index
    .filter((k) => !arrays.includes(k)) // exclude arrays
  const values = await Promise.all(propNames.map((k) => lock[k]()))

  // assertions
  propNames.forEach((k, i) => {
    if (
      ethers.BigNumber.isBigNumber(serialized[k]) &&
      ethers.BigNumber.isBigNumber(values[i])
    ) {
      assert.equal(
        serialized[k].eq(values[i]),
        true,
        `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
      )
    } else {
      assert.equal(
        serialized[k],
        values[i],
        `different serialized value ${k}, ${serialized[k]}, ${values[i]}`
      )
    }
  })
}

module.exports = compareValues
