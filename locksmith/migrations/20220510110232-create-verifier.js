'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Verifiers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      verifierAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lockAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lockManager: {
        type: Sequelize.STRING,
        allowNull: false
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Verifiers');
  }
};