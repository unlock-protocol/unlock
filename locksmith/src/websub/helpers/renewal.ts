import { networks } from '@unlock-protocol/networks'

export async function runRenewal(fn: (network: number) => Promise<void>) {
  const tasks: Promise<void>[] = []
  for (const network of Object.values(networks)) {
    // Don't run jobs on test networks in production
    if (process.env.UNLOCK_ENV === 'prod' && network.isTestNetwork) {
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
