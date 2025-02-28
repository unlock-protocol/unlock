'use strict'

const table = 'EventData'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('ProcessedHookItems', {
      fields: ['objectId', 'network'],
      unique: true,
    })
    await queryInterface.removeIndex(
      'ProcessedHookItems',
      'processed_hook_items_object_id'
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('ProcessedHookItems', {
      fields: ['objectId'],
      unique: true,
    })

    await queryInterface.removeIndex(
      'ProcessedHookItems',
      'processed_hook_items_object_id_network'
    )
  },
}
