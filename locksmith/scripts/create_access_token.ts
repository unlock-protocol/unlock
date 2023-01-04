import { createAccessToken } from '../src/utils/middlewares/auth'

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
  .parse()

if (argv.address) {
  const token = createAccessToken({
    type: 'user',
    walletAddress: argv.address,
  })
  console.log(token)
} else {
  console.log(argv)
}
