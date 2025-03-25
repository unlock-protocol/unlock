'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EventData', 'eventType', {
      type: Sequelize.ENUM('unlock', 'external'),
      defaultValue: 'unlock',
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EventData', 'eventType')
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_EventData_eventType";'
    )
  },
}
