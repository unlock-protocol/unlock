'use strict'

const table = 'StripeCustomers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(table, 'StripeCustomers_pkey')
    await queryInterface.addConstraint(
      table,
      ['publicKey', 'stripeConnectedAccountId'],
      {
        type: 'primary key',
        name: 'stripe_customers_pkey',
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(table, 'stripe_customers_pkey')
    await queryInterface.addConstraint(table, 'publicKey', {
      type: 'primary key',
      name: 'stripe_customers_pkey',
    })
  },
}
