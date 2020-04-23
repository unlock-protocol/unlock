'use strict'

const table = 'StripeCustomers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'stripeConnectedAccountId', {
      type: Sequelize.STRING,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'stripeConnectedAccountId')
  },
}
