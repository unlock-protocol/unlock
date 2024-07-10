import networks from '../src'
import { log } from './logger'

const expectedKeys = Object.keys(networks['1'])

Object.keys(networks).forEach((network) => {
  if (network !== '31337') {
    const missingProperties: string[] = []
    expectedKeys.forEach((key) => {
      if (!(key in networks[network])) {
        missingProperties.push(key as string)
      }
    })

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
