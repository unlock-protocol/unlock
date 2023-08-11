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
    if (missingProperties.length === 0) {
      console.log(`\nNetwork: ${networks[network].name} ✅`)
    } else {
      console.log(`\nNetwork: ${networks[network].name}:`)
      missingProperties.forEach((missingProperty) => {
        console.error(` ❌ Missing property ${missingProperty}`)
      })
    }
  }
})
