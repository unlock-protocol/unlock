import { Task } from 'graphile-worker'
import { networks } from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import config from '../../../config/config'
import { getRenewalKeys } from '../../taskUtils/getRenewalKeys'
import normalizer from '../../../utils/normalizer'

export const createAddRenewalJobs = (start: number, end: number) => {
  const addRenewalJobs: Task = async (_, helper) => {
    for (const network of Object.values(networks)) {
      if (network.isTestNetwork && config.isProduction) {
        continue
      }

      if (network.id === 31337) {
        continue
      }

      const expiredKeys = await getRenewalKeys({
        start,
        end,
        network: network.id,
      })

      for (const key of expiredKeys) {
        if (key.lock.version > 11) {
          await helper.addJob(
            'fiatRenewalJob',
            {
              keyId: key.tokenId,
              lockAddress: normalizer.ethereumAddress(key.lock.address),
              network: network.id,
              userAddress: normalizer.ethereumAddress(key.owner),
            },
            {
              jobKey: `fiat-renewal-${key.tokenId}-${key.lock.address}-${network.id}`,
              maxAttempts: 2,
            }
          )
        }
        if (key.lock.tokenAddress !== ethers.ZeroAddress) {
          await helper.addJob(
            'cryptoRenewalJob',
            {
              keyId: key.tokenId,
              lockAddress: normalizer.ethereumAddress(key.lock.address),
              network: network.id,
              userAddress: normalizer.ethereumAddress(key.owner),
            },
            {
              jobKey: `crypto-renewal-${key.tokenId}-${key.lock.address}-${network.id}`,
              maxAttempts: 2,
            }
          )
        }
      }
    }
  }
  return addRenewalJobs
}

// Catch any key that will expire in the next 15 minutes or have expired 15 minutes ago
export const addRenewalJobs = createAddRenewalJobs(60 * 15, 60 * 15)
// Catch any key that will expire in the next hour (this should be most of them!)
export const addRenewalJobsHourly = createAddRenewalJobs(0, 60 * 60)
// Catch any keys that may have been missed during the last week
export const addRenewalJobsDaily = createAddRenewalJobs(60 * 60 * 24 * 7, 0)
// Catch any keys that may have been missed during the last year
export const addRenewalJobsWeekly = createAddRenewalJobs(60 * 60 * 24 * 365, 0)
