'use strict';

const table = 'Locks'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'chain', {
      type: Sequelize.INTEGER,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'chain')
  }
};
