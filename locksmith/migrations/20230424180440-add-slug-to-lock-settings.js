'use strict'
const table = 'LockSettings'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      unique: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'slug')
  },
}
