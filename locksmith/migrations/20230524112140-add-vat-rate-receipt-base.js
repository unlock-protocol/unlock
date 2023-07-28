'use strict'
const table = 'ReceiptBases'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'vatBasisPointsRate', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'vatBasisPointsRate')
  },
}
