'use strict'

/** @type {import('sequelize-cli').Migration} */

const table = 'EventData'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(table, {
      fields: ['checkoutConfigId'],
      unique: true,
      name: 'checkoutConfigId_index',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(table, 'checkoutConfigId_index')
  },
}
