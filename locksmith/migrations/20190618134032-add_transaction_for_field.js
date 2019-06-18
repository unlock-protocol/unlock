'use strict'

const table = 'Transactions'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'for', {
      type: Sequelize.TEXT,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'for')
  },
}
