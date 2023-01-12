'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hooks', 'network', {
      type: 'INTEGER USING CAST("network" as INTEGER)',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hooks', 'network', {
      type: Sequelize.STRING,
    })
  },
}
