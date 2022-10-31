import { notifyNewKeysToWedlocks } from '../src/operations/wedlocksOperations'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import yargs from 'yargs'

const argv = yargs
  .option('network', {
    requiresArg: true,
    type: 'number',
    alias: 'n',
    description: 'Network ID of the network',
  })
  .option('lockAddress', {
    requiresArg: true,
    type: 'string',
    alias: 'l',
    description: 'Lock Address to use.',
  })
  .help()
  .alias('h', 'help')
  .example(
    'yarn ts-node scripts/send_email.ts --network 5 --lockAddress xyz',
    'send emails to all users on goerli on xyz lock address.'
  ).argv

interface Options {
  lockAddress: string
  network: number
}

async function run({ lockAddress, network }: Options) {
  const service = new SubgraphService()
  const keys = await service.keys(
    {
      first: 1000,
      where: {
        lock_in: [lockAddress.toLowerCase()],
      },
    },
    {
      networks: [network],
    }
  )
  await notifyNewKeysToWedlocks(keys, network)
  return keys
}

if (argv.lockAddress && argv.network) {
  run({
    lockAddress: argv.lockAddress,
    network: argv.network,
  })
    .then((keys) => {
      console.log(
        `Successfully sent emails to recipients associated with ${keys.length} keys.`
      )
    })
    .catch(console.error)
} else {
  console.log(argv)
}
