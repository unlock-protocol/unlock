'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LockSettings', {
      lockAddress: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sendEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      replyTo: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('LockSettings')
  },
}
