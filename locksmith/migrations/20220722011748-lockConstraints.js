'use strict'

const table = 'Locks'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint(table, {
      type: 'unique',
      name: 'lock_address_unique_constraint',
      fields: ['address'],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeContraint(
      table,
      'lock_address_unique_constraint'
    )
  },
}
