'use strict'
const table = 'EventData'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'pendingLockTransaction', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn(table, 'pendingLockNetwork', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })

    await queryInterface.addColumn(table, 'lockAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'pendingLockTransaction')
    await queryInterface.removeColumn(table, 'pendingLockNetwork')
    await queryInterface.removeColumn(table, 'lockAddress')
  },
}
