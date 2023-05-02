'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KeyExpirationReminders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lockAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tokenId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiration: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('KeyExpirationReminders', {
      fields: ['lockAddress', 'network', 'tokenId', 'type', 'expiration'],
      unique: true,
      name: 'id_address_expiration_token_type',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('KeyExpirationReminders')
  },
}
