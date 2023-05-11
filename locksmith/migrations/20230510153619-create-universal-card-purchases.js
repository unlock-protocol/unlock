'use strict';

const table = 'UniversalCardPurchases'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      lockAddress: {
        type: Sequelize.STRING
      },
      network: {
        type: 'pg_chain_id'
      },
      userAddress: {
        type: Sequelize.STRING
      },
      stripeSession: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex(table, {
      fields: ['stripeSession'],
      name: 'stripeSession_index',
    })
    await queryInterface.addIndex(table, {
      fields: ['userAddress'],
      name: 'userAddress_index',
    })
    await queryInterface.addIndex(table, {
      fields: ['lockAddress'],
      name: 'lockAddress_index',
    })

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table);
  }
};