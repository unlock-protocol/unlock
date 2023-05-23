// Stripe's fee is 30 cents plus 2.9% of the transaction.
export const baseStripeFee = 30
export const stripePercentage = 0.029
export const GAS_COST = 200000 // hardcoded : TODO get better estimate, based on actual execution
export const GAS_COST_TO_GRANT = 250000
export const MIN_PAYMENT_STRIPE_LINK = 100
export const MIN_PAYMENT_STRIPE_CREDIT_CARD = 50
