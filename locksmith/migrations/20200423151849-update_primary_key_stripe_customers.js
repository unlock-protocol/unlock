'use strict'

const table = 'StripeCustomers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint(
      table,
      ['publicKey', 'stripeConnectedAccountId'],
      {
        type: 'unique',
        name: 'stripe_customers_pkey',
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(table, 'stripe_customers_pkey')
  },
}
