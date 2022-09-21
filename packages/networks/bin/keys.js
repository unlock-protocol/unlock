const { networks } = require('../dist')

const keys = Object.keys(networks['1'])
keys.forEach((key) => {
  Object.keys(networks).forEach((network) => {
    if (!networks[network][key] && network !== '31337') {
      console.error(`Missing property ${key} on ${network}`)
    }
  })
})
