/**
 * Applied to itself, yields "Camel Case To Title"
 */
export function camelCaseToTitle(s: string): string {
  return (
    s
      // insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, (str) => str.toUpperCase())
  )
}

export function addressMinify(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
