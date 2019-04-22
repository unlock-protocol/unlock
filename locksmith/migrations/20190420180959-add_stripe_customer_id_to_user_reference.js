'use strict'

const table = 'UserReferences'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'stripe_customer_id', {
      type: Sequelize.STRING,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'stripe_customer_id')
  },
}
