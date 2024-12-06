'use strict'
const table = 'EventData'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'lockAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn(table, 'pendingTransactionHash', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn(table, 'network', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.addColumn(table, 'isPending', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'lockAddress')
    await queryInterface.removeColumn(table, 'pendingTransactionHash')
    await queryInterface.removeColumn(table, 'network')
    await queryInterface.removeColumn(table, 'isPending')
  },
}
