import fromExponential from 'from-exponential'

export function formatNumber(number: number) {
  return fromExponential(Number(number).toPrecision(4))
}
