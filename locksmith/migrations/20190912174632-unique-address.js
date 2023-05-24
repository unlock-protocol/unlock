'use strict'

const table = 'AuthorizedLocks'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn(table, 'address', {
      type: Sequelize.STRING,
      unique: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn(table, 'address', {
      type: Sequelize.STRING,
    })
  },
}
