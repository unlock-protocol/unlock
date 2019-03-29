const ethJsUtil = require('ethereumjs-util')

export function emailAddress(input: string): string {
  return input.toLocaleLowerCase()
}

export function ethereumAddress(input: string): string {
  return ethJsUtil.toChecksumAddress(input)
}

export default {
  emailAddress,
  ethereumAddress,
}
