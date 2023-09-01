'use strict'
const table = 'LockSettings'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'creditCardCurrency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'usd',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'creditCardCurrency')
  },
}
