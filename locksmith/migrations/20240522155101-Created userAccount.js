'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserAccounts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      loginMethod: {
        type: Sequelize.ENUM(
          'UNLOCK_ACCOUNT',
          'GOOGLE_ACCOUNT',
          'PASSKEY_ACCOUNT',
          'EMAIL_CODE',
          'NONE'
        ),
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserAccounts')
  },
}
