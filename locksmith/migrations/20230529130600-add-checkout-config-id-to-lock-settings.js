'use strict'
const table = 'LockSettings'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'checkoutConfigId', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'checkoutConfigId')
  },
}
