import networks from '../src'
import { log } from './logger'
import { validateKeys } from './validate'

Object.keys(networks).forEach((network) => {
  if (network !== '31337') {
    const missingProperties = validateKeys(network)
    if (missingProperties.length !== 0) {
      missingProperties.forEach((missingProperty) => {
        log(
          `[Networks/Keys]: ${networks[network].name} -  ❌ Missing property ${missingProperty}`,
          'info'
        )
      })
    }
  }
})
