export interface Currency {
  symbol: string
  currency: string // Three-letter ISO currency code, in lowercase.
}

export const Currencies: Currency[] = [
  { symbol: '$', currency: 'usd' },
  { symbol: '€', currency: 'eur' },
  { symbol: 'R$', currency: 'brl' },
]
