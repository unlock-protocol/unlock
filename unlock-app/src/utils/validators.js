// tests whether a field's value was not entered by the user
export const isNotEmpty = val => val || val === 0

// tests whether a number is positive and not a decimal number
export const isPositiveInteger = val => {
  const parsedInt = parseInt(val)
  return !isNaN(parsedInt) && val == parsedInt && +val > 0
}

export const isLTE = limit => {
  return val => {
    const parsedInt = parseInt(val)
    return parsedInt <= limit
  }
}

// tests whether a number is a non-negative real number (decimals allowed)
export const isPositiveNumber = val => {
  const parsedFloat = parseFloat(val)
  return !isNaN(parsedFloat) && +parsedFloat >= 0
}
