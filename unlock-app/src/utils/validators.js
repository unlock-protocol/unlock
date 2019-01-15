export const isNotEmpty = val => val || val === 0
export const isPositiveInteger = val =>
  !isNaN(val) && +val === parseInt(val) && +val > 0
export const isPositiveNumber = val => !isNaN(val) && +val > 0
