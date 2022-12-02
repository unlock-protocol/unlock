'use strict'

const table = 'StripeCustomers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint(table, {
      type: 'unique',
      fields: ['publicKey', 'stripeConnectedAccountId'],
      name: 'stripe_customers_pkey',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(table, 'stripe_customers_pkey')
  },
}
