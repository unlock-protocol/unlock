'use strict'

const table = 'StripeCustomers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint(table, {
      type: 'unique',
      name: 'stripe_customers_pkey',
      fields: ['publicKey'],
    })
    await queryInterface.addConstraint(table, {
      type: 'unique',
      name: 'stripe_customers_connectedAccountId',
      fields: ['stripeConnectedAccountId'],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      table,
      'stripe_customers_connectedAccountId'
    )
    await queryInterface.removeConstraint(table, 'stripe_customers_pkey')
  },
}
