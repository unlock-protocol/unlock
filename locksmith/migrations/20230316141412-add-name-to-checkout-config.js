'use strict'
const table = 'CheckoutConfigs'
const crypto = require('crypto')
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      // Default for existing rows
      defaultValue: crypto.randomBytes(16).toString('hex'),
    })

    await queryInterface.addConstraint(table, {
      fields: ['name', 'createdBy'],
      type: 'unique',
      name: 'checkout_configs_by_user_and_name',
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn(table, 'name')
  },
}
