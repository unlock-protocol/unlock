'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReceiptBases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lockAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      supplierName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vat: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      servicePerformed: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      addressLine1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      addressLine2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      zip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReceiptBases')
  },
}
