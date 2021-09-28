import { ethers } from 'ethers'

// A helper which yields an ether provider

export const getTestProvider = ({ accountAddress = '0xaccount' }) => {
  const provider = new ethers.providers.JsonRpcProvider('')
  provider.getSigner = () => ({
    getAddress: jest.fn(() => Promise.resolve(accountAddress)),
  })
  return provider
}
