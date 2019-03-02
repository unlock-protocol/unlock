const logger = require('./logger')

module.exports = {
  logLockClone: (startAddress, targetAddress) => {
    logger.info(`${startAddress} -> ${targetAddress}`)
  },
  logCloneUnable: (address, requester) => {
    logger.error(`unable to clone ${address}, requester: ${requester}`)
  },
  logCloneMissingInfo: address => {
    logger.error(`unable to clone ${address} required information missing`)
  },
  logLockDetailsStored: address => {
    logger.info(`${address} details stored`)
  },
  logAttemptedOverwrite: address => {
    logger.error(`An attempt at overwriting ${address}`)
  },
  logLockDetailsRequest: address => {
    logger.debug(`requesting lock details for ${address}`)
  },
  logFailureRequestingBlockTimestamp: error => {
    logger.error(error)
  },
  logFailureToStoreLock: error => {
    logger.error(error)
  },
}
