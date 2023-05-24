'use strict'

const config = require('../config/config')

const table = 'KeyMetadata'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!config.defaultNetwork) {
      console.error('CANNOT MIGRATE WITHOUT A DEFAULT NETWORK')
      throw new Error('Missing default network')
    }

    // Add column
    await queryInterface.addColumn(table, 'chain', {
      type: Sequelize.INTEGER,
    })

    // And now let's set the right value!
    await queryInterface.bulkUpdate(
      table,
      {
        chain: parseInt(config.defaultNetwork),
      },
      {
        chain: null,
      }
    )

    // And make sure we never allow for any null one
    await queryInterface.changeColumn(table, 'chain', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'chain')
  },
}
