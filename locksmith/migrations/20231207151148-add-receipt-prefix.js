'use strict'
const table = 'ReceiptBases'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'prefix', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'prefix')
  },
}
