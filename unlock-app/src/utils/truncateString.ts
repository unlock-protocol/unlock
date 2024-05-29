export function truncateString(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  const shortenedString = text.substring(0, maxLength)
  const lastSpaceIndex = shortenedString.lastIndexOf(' ')

  if (lastSpaceIndex !== -1) {
    return shortenedString.substring(0, lastSpaceIndex) + '...'
  } else {
    return shortenedString + '...'
  }
}
