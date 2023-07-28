'use strict'

const table = 'Locks'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(table, { fields: ['address'] })
    await queryInterface.addIndex(table, { fields: ['owner'] })
    await queryInterface.addIndex(table, { fields: ['address', 'createdAt'] })
    await queryInterface.addIndex(table, { fields: ['owner', 'createdAt'] })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(table, 'locks_address')
    await queryInterface.removeIndex(table, 'locks_owner')
    await queryInterface.removeIndex(table, 'locks_address_created_at')
    await queryInterface.removeIndex(table, 'locks_owner_created_at')
  },
}
