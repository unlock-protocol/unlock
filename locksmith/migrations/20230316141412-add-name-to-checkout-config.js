'use strict'
const table = 'CheckoutConfigs'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn(table, 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn(table, 'name')
  },
}
