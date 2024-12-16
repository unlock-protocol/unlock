export interface PriceFormatterProps {
  price: string
  precision?: number
}

export function PriceFormatter({ price, precision = 4 }: PriceFormatterProps) {
  if (!price) return ''

  const decimalIndex = price.indexOf('.')

  const removeTrailingZeroes = (number: string): string => {
    for (let i = number.length - 1; i >= 0; i--) {
      if (number.charAt(i) === '.') {
        return number.substring(0, i)
      } else if (number.charAt(i) !== '0') {
        return number.substring(0, i + 1)
      }
    }

    return number
  }

  // If not decimal - return
  if (decimalIndex === -1 || decimalIndex === price.length - 1) {
    return price
  }

  const fractionalPart = price.substring(decimalIndex + 1)

  // Numbers of zeroes
  let numZeroes = 0
  for (let i = 0; i < fractionalPart.length; i++) {
    if (fractionalPart.charAt(i) === '0') {
      numZeroes++
    } else {
      break
    }
  }

  if (numZeroes > 3) {
    return (
      <>
        {`${price.substring(0, decimalIndex)}.0`}
        <span className="lower text-xs">{numZeroes - 1}</span>
        {removeTrailingZeroes(
          price.substring(decimalIndex + 1 + numZeroes).substring(0, 4)
        )}
      </>
    )
  } else {
    return removeTrailingZeroes(
      price.substring(0, decimalIndex + 1 + numZeroes + precision)
    )
  }
}
