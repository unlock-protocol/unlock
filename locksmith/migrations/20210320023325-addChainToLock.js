'use strict';

const config = require('../config/config')

const table = 'Locks'


module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!config.defaultNetwork) {
      console.error('CANNOT MIGRATE WITHOUT A DEFAULT NETWORK')
      throw new Error('Missing default network')
    }

    await queryInterface.addColumn(table, 'chain', {
      type: Sequelize.INTEGER,
    })
    // And now let's set the right value!
    await queryInterface.bulkUpdate(table, {
      chain: parseInt(config.defaultNetwork),
    }, {
      chain: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'chain')
  }
};
