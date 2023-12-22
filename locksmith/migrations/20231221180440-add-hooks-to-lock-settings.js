'use strict'
const table = 'LockSettings'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'hooks', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {},
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'hooks')
  },
}
