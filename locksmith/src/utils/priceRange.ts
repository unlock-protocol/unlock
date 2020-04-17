const THRESHOLD = 0.03

interface WithinParams {
  requestPrice: number
  currentPrice: number
}

export function within(params: WithinParams): boolean {
  const range = generateRange(params.currentPrice, THRESHOLD)
  return (
    params.requestPrice >= range.lower && params.requestPrice <= range.upper
  )
}

function generateRange(value: number, percentage: number): any {
  return { upper: value * (1 + percentage), lower: value * (1 - percentage) }
}
