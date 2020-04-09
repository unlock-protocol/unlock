const THERSHOLD = 0.03

export function within(requestedPrice: number, current: number): boolean {
  const range = generateRange(current, THRESHOLD)
  return requestedPrice >= range.lower && requestedPrice <= range.upper
}

function generateRange(value: number, percentage: number): any {
  return { upper: value * (1 + percentage), lower: value * (1 - percentage) }
}
