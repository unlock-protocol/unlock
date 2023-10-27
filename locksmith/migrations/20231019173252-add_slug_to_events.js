'use strict'

/** @type {import('sequelize-cli').Migration} */

const table = 'EventData'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'slug', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })
    await queryInterface.addIndex(table, {
      fields: ['slug'],
      unique: true,
      name: 'unique_slug',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'slug')
  },
}
