import Stripe from 'stripe'

import config from '../config/config'

const stripe = new Stripe(config.stripeSecret!, {
  apiVersion: '2024-11-20.acacia',
})

export default stripe
