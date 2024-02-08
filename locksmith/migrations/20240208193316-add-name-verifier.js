'use strict'
const table = 'Verifier'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'name')
  },
}
