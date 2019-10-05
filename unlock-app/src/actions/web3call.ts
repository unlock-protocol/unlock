import { web3MethodCall, web3MethodResult } from '../windowTypes'

export const WEB3_CALL = 'web3.call'
export const WEB3_RESULT = 'web3.result'

export const web3Call = (payload: web3MethodCall) => ({
  type: WEB3_CALL,
  payload,
})

export const web3Result = (payload: web3MethodResult) => ({
  type: WEB3_RESULT,
  payload,
})
