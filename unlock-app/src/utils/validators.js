// tests whether a field's value was not entered by the user
export const isNotEmpty = val => val || val === 0

// tests whether a number is postive and not a decimal number
export const isPositiveInteger = val =>
  !isNaN(val) && +val === parseInt(val) && +val > 0

// tests whether a number is a positive real number (decimals allowed)
export const isPositiveNumber = val => !isNaN(val) && +val > 0
