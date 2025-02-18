import { ethers } from 'ethers'
import configure from '~/config'

const config = configure()

/**
 * Shared provider instance for ENS resolutions.
 */
const ensProvider = new ethers.JsonRpcProvider(config.networks[1].provider)

export default ensProvider
