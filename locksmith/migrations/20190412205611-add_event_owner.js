'use strict'

const table = 'Events'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'owner', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'owner')
  },
}
