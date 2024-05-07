'use strict'
const table = 'Verifiers'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(table, 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addConstraint(table, {
      type: 'unique',
      fields: ['slug', 'address'],
      name: 'slug_address_unique_constraint',
    })
    await queryInterface.changeColumn(table, 'lockAddress', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.changeColumn(table, 'network', {
      type: 'pg_chain_id',
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      table,
      'slug_address_unique_constraint'
    )
    await queryInterface.removeColumn(table, 'slug')
  },
}
