export function chunk<T>(array: readonly T[], size: number) {
  if (!array.length) {
    return []
  }

  const result: T[][] = []

  let currentIndex = 0

  while (currentIndex < array.length) {
    result.push(array.slice(currentIndex, currentIndex + size))
    currentIndex += size
  }
  return result
}
