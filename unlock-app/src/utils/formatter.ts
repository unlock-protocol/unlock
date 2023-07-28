import fromExponential from 'from-exponential'

export function formatNumber(number: number) {
  return fromExponential(Number(number).toPrecision(4))
}

export const trimString = (string: string, maxLength: number) => {
  if (string.length > maxLength) {
    return `${string.slice(0, maxLength - 3)}...`
  }
  return string
}
