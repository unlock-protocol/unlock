'use strict'

/** @type {import('sequelize-cli').Migration} */

const table = 'EventData'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'checkoutConfigId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'checkoutConfigId')
  },
}
