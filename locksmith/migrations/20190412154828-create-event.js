'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lockAddress: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      logo: {
        type: Sequelize.STRING,
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Events')
  },
}
