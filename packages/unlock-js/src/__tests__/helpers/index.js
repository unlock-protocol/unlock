import integration from './integration'
import hardhat from './hardhat'
import contracts from './contracts'
import coinbase from './coinbase'

export default {
  ...integration,
  ...hardhat,
  ...coinbase,
  ...contracts,
}
