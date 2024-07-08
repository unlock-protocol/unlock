'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Authenticator', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      credentialID: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'NextAuthUser',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      providerAccountId: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      credentialPublicKey: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      counter: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      credentialDeviceType: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      credentialBackedUp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      transports: {
        type: Sequelize.TEXT,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Authenticator')
  },
}
