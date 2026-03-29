const integerFormatter = new Intl.NumberFormat('en-US')

export function formatTokenAmount(value: bigint, decimals = 18) {
  const negative = value < 0n
  const absoluteValue = negative ? value * -1n : value
  const divisor = 10n ** BigInt(decimals)
  const whole = absoluteValue / divisor
  const fraction = absoluteValue % divisor
  const fractionText = fraction
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')
    .slice(0, 2)

  const formattedWhole = integerFormatter.format(Number(whole))
  const formattedValue = fractionText
    ? `${formattedWhole}.${fractionText}`
    : formattedWhole

  return negative ? `-${formattedValue}` : formattedValue
}

export function formatDateTime(timestamp: bigint | null) {
  if (!timestamp) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(Number(timestamp) * 1000)
}

export function formatRelativeTime(timestamp: bigint, now: bigint) {
  const deltaSeconds = Number(timestamp - now)
  const absoluteSeconds = Math.abs(deltaSeconds)

  if (absoluteSeconds < 60) {
    return deltaSeconds >= 0 ? 'in under a minute' : 'under a minute ago'
  }

  const units = [
    { seconds: 86400, label: 'day' },
    { seconds: 3600, label: 'hour' },
    { seconds: 60, label: 'minute' },
  ]

  for (const unit of units) {
    if (absoluteSeconds >= unit.seconds) {
      const value = Math.floor(absoluteSeconds / unit.seconds)
      const suffix = value === 1 ? unit.label : `${unit.label}s`
      return deltaSeconds >= 0
        ? `in ${value} ${suffix}`
        : `${value} ${suffix} ago`
    }
  }

  return 'just now'
}

export function formatDuration(seconds: bigint | number) {
  const s = Number(seconds)
  if (s <= 0) return '0 seconds'

  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const secs = s % 60

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  // Seconds are shown only for sub-hour durations — once hours or days are
  // present the precision is not useful for governance delay/period display.
  if (secs && !days && !hours) parts.push(`${secs}s`)

  return parts.join(' ')
}

export function truncateAddress(address: string, size = 4) {
  if (address.length <= size * 2 + 2) {
    return address
  }

  return `${address.slice(0, size + 2)}...${address.slice(-size)}`
}

export function percentage(value: bigint, total: bigint) {
  if (total === 0n) {
    return '0%'
  }

  return `${(Number((value * 10000n) / total) / 100).toFixed(1)}%`
}
