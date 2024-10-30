import Stripe from 'stripe'

import config from '../config/config'

const stripe = new Stripe(config.stripeSecret!, {
  apiVersion: '2024-09-30.acacia',
})

export default stripe
