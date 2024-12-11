'use strict'

const table = 'EventData'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'status', {
      type: Sequelize.ENUM('pending', 'deployed'),
      allowNull: false,
      defaultValue: 'pending',
    })

    await queryInterface.addColumn(table, 'transactionHash', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(table, 'transactionHash')
    await queryInterface.removeColumn(table, 'status')
    // Remove the ENUM type as well
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_EventData_status";'
    )
  },
}
