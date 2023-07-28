const { networks } = require('../dist')

const keys = Object.keys(networks['137'])
Object.keys(networks).forEach((network) => {
  if (network !== '31337') {
    console.log(`\nNetwork: ${networks[network].name}`)
    keys.forEach((key) => {
      if (!networks[network][key]) {
        console.error(`Missing property ${key}`)
      }
    })
  }
})
