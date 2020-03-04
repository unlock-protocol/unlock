import Postmate from 'postmate'

declare let __ENVIRONMENT_VARIABLES__: { unlockAppUrl: string }

const { unlockAppUrl } = __ENVIRONMENT_VARIABLES__
const rawConfig = (window as any).unlockProtocolConfig
const encodedConfig = encodeURI(JSON.stringify(rawConfig))

const handshake = new Postmate({
  url: `${unlockAppUrl}/checkout?paywallConfig=${encodedConfig}`,
  classListArray: ['unlock-protocol-checkout'],
})

handshake.then(child => console.log(child))
