'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UnsubscribeList', {
      lockAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      network: {
        allowNull: false,
        type: 'pg_chain_id',
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

    await queryInterface.addIndex('UnsubscribeList', {
      fields: ['lockAddress', 'userAddress', 'network'],
      unique: true,
      name: 'lock_user_network',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UnsubscribeList')
  },
}
