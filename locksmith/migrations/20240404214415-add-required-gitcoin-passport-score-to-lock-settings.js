'use strict'

const table = 'LockSettings'

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'requiredGitcoinPassportScore', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'requiredGitcoinPassportScore')
  },
}
