'use strict'

const table = 'CheckoutConfigs'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table, {
      id: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    await queryInterface.addIndex(table, {
      fields: ['id', 'createdBy'],
      unique: true,
      name: 'id_createdBy_index',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table)
  },
}
