import networks from '../src'
import { log } from './logger'
import { validateKeys } from './utils/keys'

Object.keys(networks).forEach((chainId) => {
  if (chainId !== '31337') {
    const missingProperties = validateKeys(networks[chainId])
    if (missingProperties.length !== 0) {
      missingProperties.forEach((missingProperty) => {
        log(
          `[Networks/Keys]: ${networks[chainId].name} -  ❌ Missing property ${missingProperty}`,
          'info'
        )
      })
    }
  }
})
