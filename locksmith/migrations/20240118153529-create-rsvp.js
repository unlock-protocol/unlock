'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rsvps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      network: {
        allowNull: false,
        type: 'pg_chain_id',
      },
      lockAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      approval: {
        type: Sequelize.STRING,
        allowNull: false,
        default: 'pending',
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
    await queryInterface.addIndex('Rsvps', {
      unique: true,
      fields: ['lockAddress', 'network', 'approval'],
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rsvps')
  },
}
