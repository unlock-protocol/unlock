// Stripe's fee is 30 cents plus 2.9% of the transaction.
export const baseStripeFee = 0.3
export const stripePercentage = 0.029
export const GAS_COST = BigInt(250000) // hardcoded : TODO get better estimate, based on actual execution
export const GAS_COST_TO_GRANT = BigInt(350000)
export const MIN_PAYMENT_STRIPE_CREDIT_CARD = 0.5
export const TIMEOUT_ON_SUBGRAPH = 5000
export const PAGE_SIZE = 30
export const EVENT_CASTER_ADDRESS = '0x2Eaf2c5E20E028a0A305801748294ba0015A6bea'
