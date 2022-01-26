'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('HookEvents', 'network', {
      type: 'INTEGER USING CAST("network" as INTEGER)',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('HookEvents', 'network', {
      type: Sequelize.STRING,
    })
  },
}
