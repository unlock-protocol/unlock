import { HookType } from '@unlock-protocol/types'
import networks from '../src'
import { log } from './logger'

// Expected hooks!
const expectedHooks = {
  onKeyPurchaseHook: [
    // HookType.PASSWORD, // replaced by HookType.PASSWORD_CAPPED
    // HookType.PROMOCODE, // replaced by HookType.PROMO_CODE_CAPPED
    HookType.CAPTCHA,
    HookType.GUILD,
    HookType.PROMO_CODE_CAPPED,
    HookType.PASSWORD_CAPPED,
  ],
}

const run = async () => {
  const errors: string[] = []
  const networkIds = Object.keys(networks)
  for (const networkId of networkIds) {
    const network = networks[networkId]
    if (!network.hooks) {
      errors.push(`Missing hooks for ${network.name}`)
    } else {
      for (const hook in expectedHooks) {
        if (!network.hooks[hook]) {
          errors.push(`Missing ${hook} hook for ${network.name}`)
        } else {
          for (const expectedHook of expectedHooks[hook]) {
            const found = network.hooks[hook].find((h) => h.id === expectedHook)
            if (!found) {
              errors.push(
                `Missing ${hook} hook ${expectedHook} for ${network.name}`
              )
            }
          }
        }
      }
    }

    //   for (const token of network.tokens) {
    //     const contract = new ethers.Contract(token.address, ERC20, provider)
    //     try {
    //       const symbol = await contract.symbol()
    //       const name = await contract.name()
    //       const decimals = parseInt(await contract.decimals())

    //       if (decimals !== token.decimals) {
    //         log(
    //           `❌ Decimals mismatch for ${token.address} on ${networkId}. It needs to be "${decimals}"`
    //         )
    //       }
    //       if (name !== token.name) {
    //         log(
    //           `❌ Name mismatch for ${token.address} on ${networkId}. It needs to be "${name}"`
    //         )
    //       }
    //       if (symbol !== token.symbol) {
    //         log(
    //           `❌ Symbol mismatch for ${token.address} on ${networkId}. It needs to be "${symbol}"`
    //         )
    //       }
    //     } catch (error) {
    //       log(
    //         `❌ We could not verify ${token.address} on ${networkId}. ${error}`
    //       )
    //     }
    //   }
    // }
  }
  errors.forEach((error) => log(`[Networks/Hooks]: ${error}`))
}

run()
