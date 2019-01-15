export const missing = val => val === undefined || val === null || val === ''
export const isPositiveInteger = val =>
  !isNaN(val) && +val === parseInt(val) && +val > 0
export const isPositiveNumber = val => !isNaN(val) && +val > 0
