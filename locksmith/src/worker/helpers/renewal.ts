import { networks } from '@unlock-protocol/networks'
import { isProduction } from '../../config/config'

export async function runRenewal(fn: (network: number) => Promise<void>) {
  const tasks: Promise<void>[] = []
  for (const network of Object.values(networks)) {
    // Don't run jobs on test networks in production
    if (isProduction && network.isTestNetwork) {
      continue
    }
    if (network.id === 31337) {
      continue
    }
    const task = fn(network.id)
    tasks.push(task)
  }
  await Promise.allSettled(tasks)
}
