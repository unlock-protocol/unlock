import { createAccessToken } from '../src/utils/middlewares/auth'
import { randomUUID } from 'node:crypto'
import yargs from 'yargs'

const argv = yargs
  .option('address', {
    requiresArg: true,
    type: 'string',
    alias: 'l',
    description: 'Wallet address to use.',
  })

  .help()
  .alias('h', 'help')
  .example(
    'yarn tsx scripts/create_access_token.ts --address 0x123',
    'create an access token to test locksmith locally.'
  )
  .parseSync()

if (argv.address) {
  createAccessToken({
    walletAddress: argv.address,
    nonce: randomUUID(),
    expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  }).then((session) => {
    console.table({
      walletAddress: session.walletAddress,
      token: session.id,
    })
  })
} else {
  console.log(argv)
}
