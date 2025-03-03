import networks from '../src'
import { log } from './logger'
import { validateKeys } from './utils/keys'

const run = () => {
  const hasErrors = false
  Object.keys(networks).forEach((chainId) => {
    if (chainId !== '31337') {
      const missingProperties = validateKeys(networks[chainId])
      if (missingProperties.length !== 0) {
        // missing keys only throw warnings, not errors
        missingProperties.forEach((missingProperty) => {
          log(
            `[Networks/Keys]: ${networks[chainId].name} -  ⚠️ Missing property ${missingProperty}`,
            'info'
          )
        })
      }
    }
  })
  if (hasErrors) {
    process.exit(1)
  }
}

run()
