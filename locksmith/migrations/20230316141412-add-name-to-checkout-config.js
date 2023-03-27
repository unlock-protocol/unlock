'use strict'
const table = 'CheckoutConfigs'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    })
    await queryInterface.addConstraint(table, {
      fields: ['name', 'createdBy'],
      type: 'unique',
      name: 'checkout_configs_by_user_and_name',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(table, 'name')
    await queryInterface.removeConstraint(
      table,
      'checkout_configs_by_user_and_name'
    )
  },
}
