import { Task } from 'graphile-worker'
import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import config from '../../../config/config'
import { getRenewalKeys } from '../../taskUtils/getRenewalKeys'

export const createAddRenewalJobs = (within: number) => {
  const addRenewalJobs: Task = async (_, helper) => {
    for (const network of Object.values(networks)) {
      if (network.isTestNetwork && config.isProduction) {
        continue
      }

      if (network.id === 31337) {
        continue
      }

      const expiredKeys = await getRenewalKeys({
        within,
        network: network.id,
      })

      for (const key of expiredKeys) {
        if (key.lock.version > 11) {
          await helper.addJob(
            'fiatRenewalJob',
            {
              keyId: key.tokenId,
              lockAddress: key.lock.address,
              network: network.id,
              userAddress: key.owner,
            },
            {
              jobKey: `${key.tokenId}-${key.lock.address}-${network.id}`,
            }
          )
        }
        if (key.lock.tokenAddress !== ethers.constants.AddressZero) {
          await helper.addJob(
            'cryptoRenewalJob',
            {
              keyId: key.tokenId,
              lockAddress: key.lock.address,
              network: network.id,
              userAddress: key.owner,
            },
            {
              jobKey: `${key.tokenId}-${key.lock.address}-${network.id}`,
            }
          )
        }
      }
    }
  }
  return addRenewalJobs
}
// Run this job once a day to catch any keys that may have been missed during the last week
export const addRenewalJobs = createAddRenewalJobs(86400 * 7)
// Run this job once a week to catch any keys that may have been missed during the last year
export const addRenewalJobsWeekly = createAddRenewalJobs(86400 * 365)
