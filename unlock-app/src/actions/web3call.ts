import { web3MethodCall } from '../windowTypes'

export const WEB3_CALL = 'web3.call'

export const web3Call = (payload: web3MethodCall) => ({
  type: WEB3_CALL,
  payload,
})
