'use strict'
const table = 'UserTokenMetadata'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(table, 'updatedBy', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(table, 'updatedBy')
  },
}
