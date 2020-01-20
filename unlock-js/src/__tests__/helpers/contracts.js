import { ethers } from 'ethers'

// A helper which yields ether contract objects
export const getTestContract = ({ address, abi, provider }) => {
  const contract = new ethers.Contract(address, abi, provider)

  // WARNING: this is really strange
  // The ethers contract object defines read only properties
  // which cannot be spied on...
  // So we have to create an object which delegates to it for any method call
  // except for the ones we explicitly redefine!
  return Object.create({
    ...contract,
  })
}

// A helper which yields an unlockContact
export const getTestUnlockContract = ({
  unlockAddress = '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5',
  abi,
  provider,
}) => {
  return getTestContract({ address: unlockAddress, abi, provider })
}

// A helper which yields a lock contract
export const getTestLockContract = ({ lockAddress, abi, provider }) => {
  return getTestContract({ address: lockAddress, abi, provider })
}
