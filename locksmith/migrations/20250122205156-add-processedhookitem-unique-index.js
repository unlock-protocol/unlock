'use strict'

const table = 'ProcessedHookItems'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(table, {
      fields: ['network', 'type', 'objectId'],
      unique: true,
      name: 'processed_hook_items_unique_network_type_object',
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      table,
      'processed_hook_items_unique_network_type_object'
    )
  },
}
