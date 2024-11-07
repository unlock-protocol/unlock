'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'EventCollectionAssociations',
      'submitterAddress',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'EventCollectionAssociations',
      'submitterAddress'
    )
  },
}
