import networks from '../src'

const keys = Object.keys(networks['1'])
Object.keys(networks).forEach((network) => {
  if (network !== '31337') {
    const missingProperties = []
    keys.forEach((key) => {
      if (!(key in networks[network])) {
        missingProperties.push(key)
      }
    })
    if (missingProperties.length !== 0) {
      missingProperties.forEach((missingProperty) => {
        console.log(
          `[${networks[network].name}]: ❌ Missing property ${missingProperty}`
        )
      })
    }
  }
})
