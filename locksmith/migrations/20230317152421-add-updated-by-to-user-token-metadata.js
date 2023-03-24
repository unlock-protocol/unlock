'use strict'
const table = 'UserTokenMetadata'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn(table, 'updatedBy', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn(table, 'updatedBy')
  },
}
