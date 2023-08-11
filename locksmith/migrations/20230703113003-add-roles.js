'use strict'

const tableName = 'Roles'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['accountant']],
        },
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      network: {
        type: 'pg_chain_id',
        allowNull: false,
      },
      lockAddress: {
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
    await queryInterface.addIndex(tableName, {
      fields: ['network', 'lockAddress', 'address', 'role'],
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(tableName)
  },
}
