const { ethers } = require('hardhat')

const parseInterface = ({ functions }) => {
  const iface = new ethers.Interface(Object.values(functions))
  return iface
    .format(ethers.FormatTypes.minimal)
    .map((d) => d.split('@')[0].trim())
}

// find any missing entries
const compareInterfaces = (iface1, iface2) =>
  parseInterface(iface1).filter(
    (entry) => !parseInterface(iface2).includes(entry)
  )

module.exports = {
  parseInterface,
  compareInterfaces,
}
