'use strict'

const table = 'AuthorizedLocks'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'stripe_account_id', {
      type: Sequelize.STRING,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'stripe_account_id')
  },
}
