export const SET_PROVIDER = 'provider/SET_PROVIDER'
export const PROVIDER_READY = 'provider/PROVIDER_READY'

export const setProvider = (provider) => ({
  type: SET_PROVIDER,
  provider,
})

export const providerReady = () => ({
  type: PROVIDER_READY,
})
