import Postmate from 'postmate'

const baseUrl = 'http://localhost:3000/checkout'
const rawConfig = (window as any).unlockProtocolConfig
const encodedConfig = encodeURI(JSON.stringify(rawConfig))

const handshake = new Postmate({
  url: `${baseUrl}?paywallConfig=${encodedConfig}`,
  classListArray: ['unlock-protocol-checkout'],
})

handshake.then(child => console.log(child))
