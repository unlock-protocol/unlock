const { ethers } = require('hardhat')

const parseInterface = ({ fragments }) => {
  // TODO: add errors and event to interface?
  const iface = new ethers.Interface(
    Object.values(fragments.filter(({ type }) => type === 'function'))
  )
  return iface.format(true)
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
