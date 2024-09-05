import { log } from './logger'
import * as Sentry from '@sentry/node'
import networks from '../src'
import { validateERC20 } from './utils/erc20'

const run = async () => {
  let errors: string[] = []
  let warnings: string[] = []
  for (const chainId in networks) {
    const network = networks[chainId]
    if (network.tokens) {
      for (const token of network.tokens) {
        try {
          const { warnings: tokenWarnings, errors: tokenErrors } =
            await validateERC20({ network, token })
          errors = [...errors, ...tokenWarnings]
          warnings = [...warnings, ...tokenErrors]
        } catch (error) {
          Sentry.captureException(error)
          console.error(
            `We could not verify ${token.address} on ${chainId}. ${error}`
          )
        }
      }
    }
  }

  // log it all
  errors.forEach((error) => log(`[Networks/Tokens]: ${error}`, 'error'))
  warnings.forEach((warning) => log(`[Networks/Tokens]: ${warning}`))
}

run()
